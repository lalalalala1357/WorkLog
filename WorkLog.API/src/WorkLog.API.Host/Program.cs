using Carter;
using Modules.Common.Features;
using Modules.Common.Infrastructure;
using Modules.WorkLogs.Features;
using Modules.WorkLogs.Infrastructure;


var builder = WebApplication.CreateBuilder(args);

var myAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: myAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("http://localhost:6171")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

builder.Services.AddHealthChecks();

builder.Services.AddCarter();

// Add your modules here
builder.Services.AddCommonModule()
    .AddCommonInfrastructure();

builder.Services
    .AddWorkLogsModule(builder.Configuration)
    .AddWorkLogsInfrastructure();

// End of adding your modules

var app = builder.Build();

app.UseHttpsRedirection();

app.UseCors(myAllowSpecificOrigins);

app.MapHealthChecks("/healthz");

app.MapCarter();

app.Run();

public partial class Program { }
