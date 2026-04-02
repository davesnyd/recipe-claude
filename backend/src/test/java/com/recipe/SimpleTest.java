package com.recipe;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class SimpleTest {

    @Test
    void basicMathTest() {
        assertEquals(4, 2 + 2);
        assertEquals(10, 5 * 2);
        assertTrue(10 > 5);
    }

    @Test
    void stringTest() {
        String test = "Hello World";
        assertEquals("Hello World", test);
        assertTrue(test.contains("World"));
        assertFalse(test.isEmpty());
    }

    @Test
    void arrayTest() {
        int[] numbers = {1, 2, 3, 4, 5};
        assertEquals(5, numbers.length);
        assertEquals(1, numbers[0]);
        assertEquals(5, numbers[4]);
    }
}