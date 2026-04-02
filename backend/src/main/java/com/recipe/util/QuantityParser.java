package com.recipe.util;

import java.math.BigDecimal;
import java.math.MathContext;

/**
 * Parses quantity strings that may contain whole numbers, decimals,
 * simple fractions (e.g. "1/2"), or mixed numbers (e.g. "1 1/2").
 */
public class QuantityParser {

    private QuantityParser() {}

    /**
     * Parses a quantity string to a BigDecimal.
     *
     * @param value the quantity string, e.g. "2", "1.5", "1/2", "1 1/4"
     * @return the parsed value, or null if value is null/blank
     * @throws NumberFormatException if the string cannot be parsed
     */
    public static BigDecimal parse(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String trimmed = value.trim();

        // Mixed number: "1 1/2"
        int spaceIdx = trimmed.indexOf(' ');
        if (spaceIdx > 0 && trimmed.indexOf('/') > spaceIdx) {
            BigDecimal whole = new BigDecimal(trimmed.substring(0, spaceIdx));
            BigDecimal fraction = parseFraction(trimmed.substring(spaceIdx + 1).trim());
            return whole.add(fraction);
        }

        // Simple fraction: "1/2"
        if (trimmed.contains("/")) {
            return parseFraction(trimmed);
        }

        // Whole number or decimal
        return new BigDecimal(trimmed);
    }

    private static BigDecimal parseFraction(String fraction) {
        int slash = fraction.indexOf('/');
        if (slash < 0) {
            throw new NumberFormatException("Not a fraction: " + fraction);
        }
        BigDecimal numerator = new BigDecimal(fraction.substring(0, slash).trim());
        BigDecimal denominator = new BigDecimal(fraction.substring(slash + 1).trim());
        if (denominator.compareTo(BigDecimal.ZERO) == 0) {
            throw new NumberFormatException("Division by zero in fraction: " + fraction);
        }
        return numerator.divide(denominator, MathContext.DECIMAL64);
    }
}
