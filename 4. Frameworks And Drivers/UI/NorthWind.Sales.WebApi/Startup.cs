using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using NorthWind.Sales.Backend.DataContexts.EFCore.Options;
using NorthWind.Sales.Backend.SmtpGateways.Options;
using NorthWind.Membership.Backend.Core.Options;
using NorthWind.Membership.Backend.AspNetIdentity.Options;

namespace NorthWind.Sales.WebApi;

public static class Startup
{
    public static WebApplication CreateWebApplication(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddEndpointsApiExplorer();

        builder.Services.AddSwaggerGenBearer();

        builder.Services.AddNorthWindSalesServices(
            dbOptions =>
            {
                builder.Configuration.GetSection(DBOptions.SectionKey).Bind(dbOptions);
            },
            smtpOptions =>
            {
                builder.Configuration.GetSection(SmtpOptions.SectionKey).Bind(smtpOptions);
            },
            membershipDbOptions =>
            {
                builder.Configuration.GetSection(MembershipDBOptions.SectionKey).Bind(membershipDbOptions);
            },
            jwtOptions =>
            {
                builder.Configuration.GetSection(JwtOptions.SectionKey).Bind(jwtOptions);
            });

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                builder.Configuration.GetSection(JwtOptions.SectionKey).Bind(options.TokenValidationParameters);
                string securityKey = builder.Configuration.GetSection(JwtOptions.SectionKey)[nameof(JwtOptions.SecurityKey)];
                byte[] securityKeyBytes = Encoding.UTF8.GetBytes(securityKey);
                options.TokenValidationParameters.IssuerSigningKey = new SymmetricSecurityKey(securityKeyBytes);
            });

        builder.Services.AddAuthorization();

        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        return builder.Build();
    }

    public static WebApplication ConfigureWebApplication(WebApplication app)
    {
        app.UseExceptionHandler(builder => { });

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "NorthWind Sales WebApi v1");
            });
        }

        app.UseCors();

        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseNorthWindSalesEndpoints();

        return app;
    }
}
