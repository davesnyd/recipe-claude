package com.recipe.util;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class QuantityParserTest {

    @Test
    void parsesWholeNumber() {
        assertEquals(new BigDecimal("2"), QuantityParser.parse("2"));
    }

    @Test
    void parsesDecimal() {
        assertEquals(new BigDecimal("1.5"), QuantityParser.parse("1.5"));
    }

    @Test
    void parsesSimpleFraction_half() {
        assertEquals(0, new BigDecimal("0.5").compareTo(QuantityParser.parse("1/2")));
    }

    @Test
    void parsesSimpleFraction_quarter() {
        assertEquals(0, new BigDecimal("0.25").compareTo(QuantityParser.parse("1/4")));
    }

    @Test
    void parsesSimpleFraction_threeQuarters() {
        assertEquals(0, new BigDecimal("0.75").compareTo(QuantityParser.parse("3/4")));
    }

    @Test
    void parsesMixedNumber_oneAndHalf() {
        assertEquals(0, new BigDecimal("1.5").compareTo(QuantityParser.parse("1 1/2")));
    }

    @Test
    void parsesMixedNumber_twoAndThreeQuarters() {
        assertEquals(0, new BigDecimal("2.75").compareTo(QuantityParser.parse("2 3/4")));
    }

    @Test
    void parsesFraction_oneSixteenth() {
        assertEquals(0, new BigDecimal("0.0625").compareTo(QuantityParser.parse("1/16")));
    }

    @Test
    void parsesFraction_oneThird() {
        BigDecimal result = QuantityParser.parse("1/3");
        assertNotNull(result);
        assertTrue(result.compareTo(new BigDecimal("0.333")) > 0);
        assertTrue(result.compareTo(new BigDecimal("0.334")) < 0);
    }

    @Test
    void returnsNullForBlank() {
        assertNull(QuantityParser.parse(""));
        assertNull(QuantityParser.parse(null));
    }

    @Test
    void throwsForInvalidInput() {
        assertThrows(NumberFormatException.class, () -> QuantityParser.parse("abc"));
    }
}
