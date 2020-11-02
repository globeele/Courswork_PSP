using System;
using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ImageProcessing.Models;
using System.Net;
using System.Net.Sockets;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace ImageProcessing.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        private static int count = 0;
        private static int[] ports = null;
        private static string[] ips = null;
        private static Socket[] sockets = null;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            getip();
            return View();
        }


        [HttpPost]
        [RequestSizeLimit(40000000)]
        public IActionResult Make()
        {

            // Получаем массив для обработки.
            int LEN = 4 * 1000 * 4;
            byte[] msg = new byte[LEN];
            Request.Body.ReadAsync(msg, 0, LEN);

            // Отслылаем серверам массив по частям.
            for (int i = 0; i < count; i++)
            {
                byte[] r = new byte[LEN / count];
                Array.Copy(msg, i * LEN / count, r, 0, LEN / count);
                sockets[i] = SendMessageFromSocket(ips[i], ports[i], r);
            }

            byte[] R = new byte[LEN];

            // Получаем обработанные части от серверов.
            // Составляем общий массив R для отправки.
            for (int i = 0; i < count; i++)
            {
                byte[] r = ReceiveMessageFromSocket(sockets[i]);
                Array.Copy(r, 0, R, i * LEN / count, LEN / count);
            }

            Response.ContentType = "application/octet-stream";// Request.ContentType;
            Response.Body.WriteAsync(R, 0, R.Length);
            return Ok();
        }

        private void getip()
        {
            ViewBag.Param = "";
            if (count != 0)
            {
                List<String> s = new List<string>();
                for (int i = 0; i < count; i++)
                {
                    s.Add(ips[i] + ":" + ports[i]);
                }

                ViewBag.Param = s;
            }
        }
        public IActionResult Privacy()
        {
            getip();
            return View();
        }
        [HttpPost]
        public IActionResult Privacy2(String list)
        {
            string[] L = list.Split(',');
            count = L.Length;
            ports = new int[count];
            ips = new string[count];
            sockets = new Socket[count];

            for (int i = 0; i < count; i++)
            {
                string[] R = L[i].Split(':');
                ports[i] = int.Parse(R[1]);
                ips[i] = R[0];
            }

            getip();
            return Redirect("Privacy");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }


        private Socket SendMessageFromSocket(string ip, int port, byte[] msg)
        {
            // Соединяемся с удаленным устройством
            IPAddress ipAddr = IPAddress.Parse(ip);
            IPEndPoint ipEndPoint = new IPEndPoint(ipAddr, port);

            Socket sender = new Socket(ipAddr.AddressFamily, SocketType.Stream, ProtocolType.Tcp);

            // Соединяем сокет с удаленной точкой
            sender.Connect(ipEndPoint);

            // Отправляем данные через сокет
            int bytesSent = sender.Send(msg);

            return sender;
        }


        private byte[] ReceiveMessageFromSocket(Socket sender)
        { 
            // Получаем ответ от сервера
            // Буфер для входящих данных
            byte[] bytes = new byte[4 * 1000 * 4 / count];
            // Получаем ответ от сервера
            int bytesRec = sender.Receive(bytes);

            // Освобождаем сокет
            sender.Shutdown(SocketShutdown.Both);
            sender.Close();

            return bytes;
        }

    }

}



