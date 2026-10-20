namespace NorthWind.HttpDelegatingHandlers;

public class ExceptionDelegatingHandler : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        HttpResponseMessage Response = await base.SendAsync(request, cancellationToken);
        if (!Response.IsSuccessStatusCode)
        {
            string ErrorMessage = await Response.Content.ReadAsStringAsync(cancellationToken);
            string Source = null;
            string Message = null;
            IEnumerable<ValidationError> Errors = null;
            bool IsValidProblemDetails = false;

            switch (Response.StatusCode)
            {
                case HttpStatusCode.Unauthorized:
                case HttpStatusCode.Forbidden:
                    ErrorMessage = $"{(int)Response.StatusCode} {Response.ReasonPhrase}";
                    break;
                default:
                    try
                    {
                        var ContentType = Response.Content.Headers.ContentType?.MediaType;
                        var JsonResponse = JsonSerializer.Deserialize<JsonElement>(ErrorMessage);

                        if (ContentType == "application/problem+json" || TryGetProperty(JsonResponse, "instance", out _))
                        {
                            if (TryGetProperty(JsonResponse, "instance", out JsonElement InstanceValue))
                            {
                                string Value = InstanceValue.ToString();
                                if (Value.ToLower().StartsWith("problemdetails/"))
                                {
                                    Source = Value;
                                }
                            }

                            if (TryGetProperty(JsonResponse, "title", out var TitleValue))
                            {
                                Message = TitleValue.ToString();
                            }

                            if (TryGetProperty(JsonResponse, "detail", out var DetailValue))
                            {
                                Message = string.IsNullOrWhiteSpace(Message) ? DetailValue.ToString() : $"{Message} {DetailValue}";
                            }

                            if (TryGetProperty(JsonResponse, "errors", out JsonElement ErrorsValue))
                            {
                                if (ErrorsValue.ValueKind == JsonValueKind.Array)
                                {
                                    Errors = ErrorsValue.Deserialize<IEnumerable<ValidationError>>(
                                        new JsonSerializerOptions
                                        {
                                            PropertyNameCaseInsensitive = true
                                        });
                                }
                                else if (ErrorsValue.ValueKind == JsonValueKind.Object)
                                {
                                    var ErrorList = new List<ValidationError>();
                                    foreach (var prop in ErrorsValue.EnumerateObject())
                                    {
                                        if (prop.Value.ValueKind == JsonValueKind.Array)
                                        {
                                            foreach (var item in prop.Value.EnumerateArray())
                                            {
                                                ErrorList.Add(new ValidationError(prop.Name, item.GetString()));
                                            }
                                        }
                                        else if (prop.Value.ValueKind == JsonValueKind.String)
                                        {
                                            ErrorList.Add(new ValidationError(prop.Name, prop.Value.GetString()));
                                        }
                                    }
                                    Errors = ErrorList;
                                }
                            }

                            IsValidProblemDetails = true;
                        }
                    }
                    catch
                    {
                    }
                    break;
            }

            if (!IsValidProblemDetails)
            {
                Message = ErrorMessage;
                Source = null;
                Errors = null;
            }

            var Ex = new HttpRequestException(Message, null, Response.StatusCode);
            Ex.Source = Source;
            if (Errors != null && Errors.Any())
            {
                Ex.Data.Add("Errors", Errors);
            }

            throw Ex;
        }

        return Response;
    }

    private static bool TryGetProperty(JsonElement element, string propertyName, out JsonElement Value)
    {
        bool Found = false;
        Value = default;
        var Property = element.EnumerateObject()
            .FirstOrDefault(e => string.Compare(e.Name, propertyName, StringComparison.OrdinalIgnoreCase) == 0);
        if (Property.Value.ValueKind != JsonValueKind.Undefined)
        {
            Value = Property.Value;
            Found = true;
        }
        return Found;
    }
}
