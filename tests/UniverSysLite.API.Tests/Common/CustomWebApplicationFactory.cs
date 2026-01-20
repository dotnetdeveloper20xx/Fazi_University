using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Infrastructure.Persistence;

namespace UniverSysLite.API.Tests.Common;

public class CustomWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup> where TStartup : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove all DbContext registrations
            var dbContextDescriptors = services.Where(
                d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>) ||
                     d.ServiceType == typeof(ApplicationDbContext) ||
                     d.ServiceType == typeof(IApplicationDbContext) ||
                     d.ServiceType.Name.Contains("DbContext")).ToList();

            foreach (var descriptor in dbContextDescriptors)
            {
                services.Remove(descriptor);
            }

            // Add a new database context using an in-memory database for testing
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase($"InMemoryDbForTesting-{Guid.NewGuid()}");
            });

            services.AddScoped<IApplicationDbContext>(provider =>
                provider.GetRequiredService<ApplicationDbContext>());
        });

        builder.UseEnvironment("Testing");
    }
}
