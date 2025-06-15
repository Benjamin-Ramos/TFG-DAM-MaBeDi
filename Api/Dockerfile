# Imagen base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar sln y csproj
COPY MaBeDi/MaBeDi.csproj ./MaBeDi/
RUN dotnet restore ./MaBeDi/MaBeDi.csproj

# Copiar todo y compilar
COPY MaBeDi/. ./MaBeDi/
WORKDIR /src/MaBeDi
RUN dotnet publish -c Release -o /app/publish

# Imagen final
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MaBeDi.dll"]