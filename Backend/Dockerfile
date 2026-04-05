FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS base
WORKDIR /app
EXPOSE 5005

ENV ASPNETCORE_URLS=http://+:5005

USER app
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
ARG configuration=Release
WORKDIR /src
COPY ["API/API.csproj", "API/"]
COPY ["Application/Application.csproj" , "Application/"]
COPY ["Domain/Domain.csproj" , "Domain/"] 
COPY ["Infrastructure/Infrastructure.csproj" , "Infrastructure/"]  
RUN dotnet restore "API/API.csproj"
COPY . .
WORKDIR "/src/API"
RUN dotnet build "API.csproj" -c $configuration -o /app/build

FROM build AS publish
ARG configuration=Release
RUN dotnet publish "API.csproj" -c $configuration -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "API.dll"]