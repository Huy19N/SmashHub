import 'package:get_it/get_it.dart';

final GetIt getIt = GetIt.instance;

Future<void> setupLocator() async {
  // Đăng ký các service cục bộ (Singleton)
  // Ví dụ: getIt.registerLazySingleton(() => ApiService());
  // Ví dụ: getIt.registerLazySingleton(() => LocalStorageService());
  
  // Nếu có service nào cần await để khởi tạo (ví dụ SharedPreferences), làm ở đây:
  // final sharedPreferences = await SharedPreferences.getInstance();
  // getIt.registerSingleton<SharedPreferences>(sharedPreferences);
}
