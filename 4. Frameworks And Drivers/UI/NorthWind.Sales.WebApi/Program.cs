using NorthWind.Sales.WebApi;
using NorthWind.Sales.WebApi.Configurations;

DotEnv.Load();

var app = Startup.CreateWebApplication(args);
Startup.ConfigureWebApplication(app);
app.Run();
