using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi; // <-- Espacio de nombres correcto para Swashbuckle actualizado

namespace NorthWind.Sales.WebApi.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerGenBearer(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "NorthWind Sales WebApi",
                Version = "v1",
                Description = "NorthWind Sales API - Clean Architecture .NET 10"
            });

            options.AddSecurityDefinition("BearerToken", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "Proporciona el valor del token JWT (Bearer).",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer"
            });

            options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecuritySchemeReference("BearerToken", document),
                    new List<string>()
                }
            });
        });

        return services;
    }
}