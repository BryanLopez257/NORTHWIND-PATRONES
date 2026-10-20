using NorthWind.Sales.WebApi;

var app = Startup.CreateWebApplication(args);
Startup.ConfigureWebApplication(app);
app.Run();
