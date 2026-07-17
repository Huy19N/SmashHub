using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Minio;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Repositories;
using Repositories.Context;
using Services.Hubs;
using Services.Implementations;
using Services.Interfaces;
using Services.Settings;
using Repositories.Mongo;
using Repositories.Redis;
using StackExchange.Redis;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

BsonSerializer.RegisterSerializer(new GuidSerializer(MongoDB.Bson.GuidRepresentation.Standard));

var builder = WebApplication.CreateBuilder(args);

// ---- Configuration ----
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.Configure<PayOSSettings>(builder.Configuration.GetSection("PayOSSettings"));
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()!;

// ---- Database ----
builder.Services.AddDbContext<SmashClubContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptionsAction: sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        }));

// ---- Repositories ----
builder.Services.AddScoped<UnitOfWork>();

// Redis
string redisConnStr = builder.Configuration.GetConnectionString("RedisConnection") 
                      ?? builder.Configuration["RedisConnection"] 
                      ?? builder.Configuration["Redis:ConnectionString"] 
                      ?? "localhost:6379";

var redisOptions = ConfigurationOptions.Parse(redisConnStr);
redisOptions.AbortOnConnectFail = false;

builder.Services.AddSingleton<IConnectionMultiplexer>(sp => 
    ConnectionMultiplexer.Connect(redisOptions));
builder.Services.AddScoped<IRedisTokenRepository, RedisTokenRepository>();
builder.Services.AddScoped<IRedisEmailConfirmRepository, RedisEmailConfirmRepository>();

// Mongo
builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<IPostCommentRepository, PostCommentRepository>();
builder.Services.AddScoped<IPostLikeRepository, PostLikeRepository>();
builder.Services.AddScoped<IPostReportRepository, PostReportRepository>();
builder.Services.AddScoped<ITeamMessageRepository, TeamMessageRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

// ---- MinIO ----
var minioConfig = builder.Configuration.GetSection("MinIOSettings");
builder.Services.AddMinio(configureClient => configureClient
    .WithEndpoint(minioConfig["Endpoint"])
    .WithCredentials(minioConfig["AccessKey"], minioConfig["SecretKey"])
    .WithSSL(minioConfig.GetValue<bool>("UseSSL"))
    .Build());

// ---- Services ----
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ISportService, SportService>();
builder.Services.AddScoped<IUserSportProfileService, UserSportProfileService>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<IScheduleService, ScheduleService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IFacilityService, FacilityService>();
builder.Services.AddScoped<ICourtService, CourtService>();
builder.Services.AddScoped<ICourtCostService, CourtCostService>();
builder.Services.AddScoped<IStatusService, StatusService>();
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<IMatchmakingService, MatchmakingService>();
builder.Services.AddScoped<ISocialService, SocialService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<ISystemSettingService, SystemSettingService>();
builder.Services.AddScoped<IContentModerationService, ContentModerationService>();
builder.Services.AddScoped<IAdminService, AdminService>();


// ---- Authentication ----
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
        ClockSkew = TimeSpan.Zero
    };

    // Allow SignalR to read JWT from query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ---- Background Services ----
builder.Services.AddHostedService<Services.Implementations.PaymentCleanupService>();

// ---- Controllers ----
builder.Services.AddControllers();

// ---- Swagger ----
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SmashClub API", Version = "v1" });

    // JWT Bearer auth in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ---- SignalR -----
builder.Services.AddSignalR();

// ---- Rate Limiting ----
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? httpContext.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 200,
                QueueLimit = 2,
                Window = TimeSpan.FromMinutes(1)
            }));
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();
        }
        await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", cancellationToken: token);
    };
});

// ---- CORS ----
builder.Services.AddCors(options =>
{
      options.AddPolicy("StrictPolicy", policy =>
      {
          policy.SetIsOriginAllowed(origin => 
                  new Uri(origin).Host == "localhost" || 
                  new Uri(origin).Host.EndsWith(".vercel.app") || 
                  new Uri(origin).Host == "tad-min.io.vn" || 
                  origin.Contains("vercel.app")
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
      });
});

var app = builder.Build();

// Auto-migrate Database on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SmashClubContext>();
    try
    {
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
    

}

var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor
};
forwardedHeadersOptions.KnownNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeadersOptions);

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

// Remove UseHttpsRedirection because Nginx handles HTTPS
// app.UseHttpsRedirection();

app.UseRouting();

app.UseRateLimiter();

app.UseCors("StrictPolicy");

// ---- App Security Middleware ----
app.Use(async (context, next) =>
{
    // Bỏ qua Swagger và SignalR Hub connections (SignalR xử lý Auth riêng)
    var path = context.Request.Path;
    if (path.StartsWithSegments("/swagger") || path.StartsWithSegments("/hub") || path.StartsWithSegments("/api/files") || path.StartsWithSegments("/api/payments/webhook"))
    {
        await next();
        return;
    }

    var origin = context.Request.Headers["Origin"].ToString();
    var clientKey = context.Request.Headers["X-App-Client-Key"].ToString();

    // Nếu request không phải từ Web Browser (không có Origin)
    // thì bắt buộc phải có khóa X-App-Client-Key hợp lệ từ Mobile App
    if (string.IsNullOrEmpty(origin))
    {
        if (clientKey != "smashhub_mobile_secure_key_2026")
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsync("Forbidden: Invalid App Client Key");
            return;
        }
    }

    await next();
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<ChatHub>("/hub/chat", options =>
{
    options.LongPolling.PollTimeout = TimeSpan.FromSeconds(8);
});
app.MapHub<NotificationHub>("/hub/notifications", options =>
{
    options.LongPolling.PollTimeout = TimeSpan.FromSeconds(8);
});
app.MapHub<PresenceHub>("/hub", options =>
{
    options.LongPolling.PollTimeout = TimeSpan.FromSeconds(8);
});

app.Run();

