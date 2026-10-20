using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using NorthWind.Validation.Entities.Interfaces;
using NorthWind.Validation.Entities.ValueObjects;

namespace NorthWind.RazorComponents.Validators;

public class ModelValidator<T> : ComponentBase
{
    [CascadingParameter]
    EditContext EditContext { get; set; }

    [Parameter]
    public IModelValidatorHub<T> Validator { get; set; }

    ValidationMessageStore ValidationMessageStore;

    FieldIdentifier GetFieldIdentifier(object model, string propertyName)
    {
        if (string.IsNullOrEmpty(propertyName) || model == null)
        {
            return new FieldIdentifier(model ?? EditContext.Model, string.Empty);
        }

        try
        {
            char[] PropertyNameSeparators = new[] { '.', '[' };
            object NewModel = model;
            string PropertyPath = propertyName;
            int SeparatorIndex;
            string Token = null;

            do
            {
                SeparatorIndex = PropertyPath.IndexOfAny(PropertyNameSeparators);
                if (SeparatorIndex >= 0)
                {
                    Token = PropertyPath.Substring(0, SeparatorIndex);
                    PropertyPath = PropertyPath.Substring(SeparatorIndex + 1);

                    if (Token.EndsWith("]"))
                    {
                        Token = Token.Substring(0, Token.Length - 1);
                        var PropertyInfo = NewModel?.GetType().GetProperty("Item");
                        if (PropertyInfo == null) return new FieldIdentifier(EditContext.Model, propertyName);
                        var IndexerType = PropertyInfo.GetIndexParameters()[0].ParameterType;
                        var IndexerValue = Convert.ChangeType(Token, IndexerType);
                        NewModel = PropertyInfo.GetValue(NewModel, new object[] { IndexerValue });
                    }
                    else
                    {
                        var PropertyInfo = NewModel?.GetType().GetProperty(Token);
                        if (PropertyInfo == null) return new FieldIdentifier(EditContext.Model, propertyName);
                        NewModel = PropertyInfo.GetValue(NewModel);
                    }
                    Token = null;
                }
            } while (SeparatorIndex >= 0 && NewModel != null);

            return new FieldIdentifier(NewModel ?? EditContext.Model, Token ?? PropertyPath);
        }
        catch
        {
            return new FieldIdentifier(EditContext.Model, propertyName);
        }
    }

    public void AddErrors(IEnumerable<ValidationError> errors)
    {
        ValidationMessageStore.Clear();
        foreach (var Error in errors)
        {
            var FieldIdentifier = GetFieldIdentifier(EditContext.Model, Error.PropertyName);
            ValidationMessageStore.Add(FieldIdentifier, Error.Message);
        }
        EditContext.NotifyValidationStateChanged();
    }

    public void ClearErrors()
    {
        ValidationMessageStore?.Clear();
        EditContext?.NotifyValidationStateChanged();
    }

    async void ValidationRequested(object sender, ValidationRequestedEventArgs args)
    {
        bool IsValid = await Validator.Validate((T)EditContext.Model);
        if (IsValid)
        {
            ValidationMessageStore.Clear();
            EditContext.NotifyValidationStateChanged();
        }
        else
        {
            AddErrors(Validator.Errors);
        }
    }

    async void FieldChanged(object sender, FieldChangedEventArgs e)
    {
        ValidationMessageStore.Clear(e.FieldIdentifier);
        bool IsValid = await Validator.Validate((T)EditContext.Model);
        if (!IsValid)
        {
            foreach (var Item in Validator.Errors)
            {
                var FieldIdentifier = GetFieldIdentifier(EditContext.Model, Item.PropertyName);
                if (FieldIdentifier.FieldName == e.FieldIdentifier.FieldName &&
                    FieldIdentifier.Model == e.FieldIdentifier.Model)
                {
                    ValidationMessageStore.Add(FieldIdentifier, Item.Message);
                }
            }
        }
        EditContext.NotifyValidationStateChanged();
    }

    public override async Task SetParametersAsync(ParameterView parameters)
    {
        EditContext PreviousEditContext = EditContext;
        await base.SetParametersAsync(parameters);

        if (EditContext != PreviousEditContext)
        {
            ValidationMessageStore = new ValidationMessageStore(EditContext);
            EditContext.OnValidationRequested += ValidationRequested;
            EditContext.OnFieldChanged += FieldChanged;
        }
    }
}
