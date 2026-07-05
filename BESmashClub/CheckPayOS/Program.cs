using System;
using System.Reflection;

class Program
{
    static void Main()
    {
        var asm = Assembly.LoadFile(@"C:\Users\Admin\.nuget\packages\payos\2.1.0\lib\net8.0\PayOS.dll");
        foreach(var t in asm.GetTypes())
        {
            if (t.Name == "Webhooks")
            {
                foreach(var m in t.GetMethods())
                {
                    if (m.Name == "VerifyAsync" || m.Name == "Verify")
                    {
                        Console.WriteLine(m.Name + "(");
                        foreach(var p in m.GetParameters())
                        {
                            Console.WriteLine("  " + p.ParameterType.Name + " " + p.Name);
                        }
                        Console.WriteLine(")");
                    }
                }
            }
        }
    }
}
