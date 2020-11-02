using System;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Sockets;

namespace ServerImg
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Server.");
            var s = 2; // Радиус окрестности пиксела.

            Console.Write("Ip: ");
            IPAddress ipAddr = IPAddress.Parse(Console.ReadLine());

            Console.Write("Port: ");
            int port = int.Parse(Console.ReadLine());



            IPEndPoint ipEndPoint = new IPEndPoint(ipAddr, port);

            // Создаем сокет Tcp/Ip
            Socket sListener = new Socket(ipAddr.AddressFamily, SocketType.Stream, ProtocolType.Tcp);

            int H = 4;
            int W = 1000;

            // Назначаем сокет локальной конечной точке и слушаем входящие сокеты
            try
            {
                sListener.Bind(ipEndPoint);
                sListener.Listen(10);

                // Начинаем слушать соединения
                while (true)
                {
                    Console.WriteLine("Wait connection ...");

                    // Программа приостанавливается, ожидая входящее соединение
                    Socket handler = sListener.Accept();
                    

                    // Мы дождались клиента, пытающегося с нами соединиться

                    byte[] bytes = new byte[W * H * 4];
                    int bytesRec = handler.Receive(bytes);
                    Array.Resize(ref bytes, bytesRec);
                    H = bytesRec / (4 * 1000);

                    // Показываем данные на консоли
                    Console.Write("Connected and got.\n");





                    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ФИЛЬТР ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

                    // Копируем массив байт.
                    byte[] data =  (byte[])bytes.Clone();

                    // Радиус окрестности точки.

                    // По всем точкам изображения.
                    for (var i = 0; i < H; i++)
                    {
                        for (var j = 0; j < W; j++)
                        {


                            var i0 = (i - s < 0 ? 0 : i - s);
                            var j0 = (j - s < 0 ? 0 : j - s);

                            var i1 = (i + s >= H ? H - 1 : i + s);
                            var j1 = (j + s >= W ? W - 1 : j + s);


                            // Количество точек в окрестности.
                            double mn = (i1 - i0 + 1) * (j1 - j0 + 1);


                            // По окрестности точки (i,j).
                            double sr = 1.0;
                            double sg = 1.0;
                            double sb = 1.0;

                            // Применяем среднегармонический фильтр.
                            for (var p = i0; p <= i1; p++)
                            {
                                for (var q = j0; q <= j1; q++)
                                {
                                    double r = data[p * W * 4 + q * 4 + 0];
                                    double g = data[p * W * 4 + q * 4 + 1];
                                    double b = data[p * W * 4 + q * 4 + 2];

                                    sr *= r;
                                    sg *= g;
                                    sb *= b;
                                }
                            }

                            double fr = Math.Pow (sr, 1.0 / mn);
                            double fg = Math.Pow(sg, 1.0 / mn);
                            double fb = Math.Pow(sb, 1.0 / mn);

                            bytes[i * W * 4 + j * 4 + 0] = (byte)fr;
                            bytes[i * W * 4 + j * 4 + 1] = (byte)fg;
                            bytes[i * W * 4 + j * 4 + 2] = (byte)fb;
                        }
                    }

                    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~





                    // Отправляем ответ клиенту

                    handler.Send(bytes);

                    Console.Write("Sent\n");


                    handler.Shutdown(SocketShutdown.Both);
                    handler.Close();

                    Console.Write("Close\n\n");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
            finally
            {
                Console.ReadLine();
            }
        }
    }
}
