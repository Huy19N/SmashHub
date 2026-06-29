class GeneralStats {
  final int totalMatchesJoined;
  final double totalSpending;
  final String mostPlayedSport;

  GeneralStats({
    required this.totalMatchesJoined,
    required this.totalSpending,
    required this.mostPlayedSport,
  });

  factory GeneralStats.fromJson(Map<String, dynamic> json) {
    return GeneralStats(
      totalMatchesJoined: json['totalMatchesJoined'] ?? 0,
      totalSpending: (json['totalSpending'] ?? 0).toDouble(),
      mostPlayedSport: json['mostPlayedSport'] ?? 'Chưa có',
    );
  }
}

class UserStatisticsResponse {
  final GeneralStats generalStats;

  UserStatisticsResponse({
    required this.generalStats,
  });

  factory UserStatisticsResponse.fromJson(Map<String, dynamic> json) {
    return UserStatisticsResponse(
      generalStats: GeneralStats.fromJson(json['generalStats'] ?? {}),
    );
  }
}
