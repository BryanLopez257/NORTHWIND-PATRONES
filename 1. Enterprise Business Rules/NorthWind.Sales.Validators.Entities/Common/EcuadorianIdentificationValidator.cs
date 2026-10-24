namespace NorthWind.Sales.Validators.Entities.Common;

public static class EcuadorianIdentificationValidator
{
    public static bool IsValid(string? identification)
    {
        if (string.IsNullOrWhiteSpace(identification))
        {
            return false;
        }

        if (identification.Length == 10)
        {
            return IsValidNaturalId(identification);
        }

        if (identification.Length == 13)
        {
            return IsValidNaturalRuc(identification) || IsValidLegalRuc(identification);
        }

        return false;
    }

    public static bool IsValidNatural(string? identification)
    {
        if (string.IsNullOrWhiteSpace(identification))
        {
            return false;
        }

        if (identification.Length == 10)
        {
            return IsValidNaturalId(identification);
        }

        if (identification.Length == 13)
        {
            return IsValidNaturalRuc(identification);
        }

        return false;
    }

    public static bool IsValidLegal(string? identification)
    {
        if (string.IsNullOrWhiteSpace(identification))
        {
            return false;
        }

        return IsValidLegalRuc(identification);
    }

    private static bool IsValidNaturalId(string id)
    {
        if (id.Length != 10 || !AllDigits(id))
        {
            return false;
        }

        int province = int.Parse(id[..2]);
        if ((province < 1 || province > 24) && province != 30)
        {
            return false;
        }

        int thirdDigit = id[2] - '0';
        if (thirdDigit >= 6)
        {
            return false;
        }

        int[] coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        int sum = 0;

        for (int i = 0; i < 9; i++)
        {
            int digit = id[i] - '0';
            int product = digit * coefficients[i];
            sum += product >= 10 ? product - 9 : product;
        }

        int checkDigit = (10 - (sum % 10)) % 10;
        int lastDigit = id[9] - '0';

        return checkDigit == lastDigit;
    }

    private static bool IsValidNaturalRuc(string ruc)
    {
        if (ruc.Length != 13 || !AllDigits(ruc))
        {
            return false;
        }

        if (!int.TryParse(ruc.Substring(10, 3), out int branch) || branch < 1)
        {
            return false;
        }

        return IsValidNaturalId(ruc[..10]);
    }

    private static bool IsValidLegalRuc(string ruc)
    {
        if (ruc.Length != 13 || !AllDigits(ruc))
        {
            return false;
        }

        int province = int.Parse(ruc[..2]);
        if ((province < 1 || province > 24) && province != 30)
        {
            return false;
        }

        int thirdDigit = ruc[2] - '0';
        if (thirdDigit != 9)
        {
            return false;
        }

        if (!int.TryParse(ruc.Substring(10, 3), out int branch) || branch < 1)
        {
            return false;
        }

        int[] coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];
        int sum = 0;

        for (int i = 0; i < 9; i++)
        {
            int digit = ruc[i] - '0';
            sum += digit * coefficients[i];
        }

        int remainder = sum % 11;
        int checkDigit = 11 - remainder;

        if (remainder == 0)
        {
            checkDigit = 0;
        }
        else if (checkDigit == 11)
        {
            checkDigit = 0;
        }
        else if (checkDigit == 10)
        {
            return false;
        }

        int tenthDigit = ruc[9] - '0';
        return checkDigit == tenthDigit;
    }

    private static bool AllDigits(string value)
    {
        foreach (char c in value)
        {
            if (c < '0' || c > '9')
            {
                return false;
            }
        }
        return true;
    }
}
