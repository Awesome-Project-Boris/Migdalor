using System.Text;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using MigdalorServer.BL;
using MigdalorServer.Database;
using MigdalorServer.Services;
using YourApp.PushNotifications.Services;


var builder = WebApplication.CreateBuilder(args);

// Bind the Kestrel server to all network interfaces on port 5293
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(44315); // HTTP
});

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
    );
});

// Add controllers and Swagger
builder
    .Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.ReferenceHandler = System
            .Text
            .Json
            .Serialization
            .ReferenceHandler
            .IgnoreCycles;
    });
;
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DB Context
builder.Services.AddDbContext<MigdalorDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("myProjDB"))
);

// Add Expo Push Notification Service
builder
    .Services.AddHttpClient<ExpoPushService>() // HttpClient injected into ExpoPushService
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler());


// Cleanup services

builder.Services.AddHostedService<DailyTasksService>();

builder.Services.AddHostedService<MarketplaceCleanupService>();

builder.Services.AddHostedService<NoticeCleanupService>();

// Endless class refresher

builder.Services.AddHostedService<RecurringEventService>();


// ---- Gemini Setup ----
builder.Services.Configure<Migdalor.BL.GeminiSettings>(builder.Configuration.GetSection("Gemini"));

builder.Services.AddHttpClient<Migdalor.BL.GeminiService>();

builder.Services.AddScoped<Migdalor.BL.GeminiService>();

// ---- JWT Setup ----

// **FIX: Add a check to ensure the JWT Key is not null**
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    throw new ArgumentNullException("Jwt:Key", "JWT Key is not configured in appsettings.json. Please add a valid secret key.");
}

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // Set to true in production
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey) // Use the validated key here
            ),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();

// ---- Build App ----
var app = builder.Build();

//if (app.Environment.IsDevelopment())
//{
//}
app.UseSwagger();
app.UseSwaggerUI();

// Static file support for uploaded files
app.UseStaticFiles(
    new StaticFileOptions()
    {
        FileProvider = new PhysicalFileProvider(
            Path.Combine(Directory.GetCurrentDirectory(), @"uploadedFiles")
        ),
        RequestPath = new PathString("/Images"),
    }
);

// Apply CORS
app.UseCors("AllowAll");

// Apply authentication & authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
