using System;
using System.Reflection;

class Program
{
    static void Main()
    {
        Assembly asm = Assembly.LoadFile(@"C:\Users\Admin\.nuget\packages\payos\1.0.4\lib\net7.0\PayOS.dll");
        foreach(Type type in asm.GetTypes())
        {
            if (type.Name == "PayOSClient")
            {
                Console.WriteLine("Methods of PayOSClient:");
                foreach(MethodInfo method in type.GetMethods())
                {
                    Console.WriteLine(method.Name);
                }
            }
        }
    }
}
