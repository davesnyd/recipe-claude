package com.recipe.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MeasurementTest {

    @Test
    void testDefaultConstructor() {
        Measurement measurement = new Measurement();

        assertNull(measurement.getMeasurementId());
        assertNull(measurement.getSystem());
        assertNull(measurement.getMeasurementName());
        assertNull(measurement.getMeasurementType());
    }

    @Test
    void testParameterizedConstructor() {
        Measurement measurement = new Measurement(
            Measurement.MeasurementSystem.Imperial,
            "cup",
            Measurement.MeasurementType.volume
        );

        assertEquals(Measurement.MeasurementSystem.Imperial, measurement.getSystem());
        assertEquals("cup", measurement.getMeasurementName());
        assertEquals(Measurement.MeasurementType.volume, measurement.getMeasurementType());
    }

    @Test
    void testSettersAndGetters() {
        Measurement measurement = new Measurement();

        measurement.setMeasurementId(1L);
        measurement.setSystem(Measurement.MeasurementSystem.Metric);
        measurement.setMeasurementName("gram");
        measurement.setMeasurementType(Measurement.MeasurementType.weight);

        assertEquals(1L, measurement.getMeasurementId());
        assertEquals(Measurement.MeasurementSystem.Metric, measurement.getSystem());
        assertEquals("gram", measurement.getMeasurementName());
        assertEquals(Measurement.MeasurementType.weight, measurement.getMeasurementType());
    }

    @Test
    void testMeasurementSystemEnum() {
        assertEquals(2, Measurement.MeasurementSystem.values().length);
        assertEquals(Measurement.MeasurementSystem.Imperial, Measurement.MeasurementSystem.valueOf("Imperial"));
        assertEquals(Measurement.MeasurementSystem.Metric, Measurement.MeasurementSystem.valueOf("Metric"));
    }

    @Test
    void testMeasurementTypeEnum() {
        assertEquals(2, Measurement.MeasurementType.values().length);
        assertEquals(Measurement.MeasurementType.weight, Measurement.MeasurementType.valueOf("weight"));
        assertEquals(Measurement.MeasurementType.volume, Measurement.MeasurementType.valueOf("volume"));
    }

    @Test
    void testImperialVolumeMeasurement() {
        Measurement measurement = new Measurement(
            Measurement.MeasurementSystem.Imperial,
            "tablespoon",
            Measurement.MeasurementType.volume
        );

        assertEquals(Measurement.MeasurementSystem.Imperial, measurement.getSystem());
        assertEquals("tablespoon", measurement.getMeasurementName());
        assertEquals(Measurement.MeasurementType.volume, measurement.getMeasurementType());
    }

    @Test
    void testMetricWeightMeasurement() {
        Measurement measurement = new Measurement(
            Measurement.MeasurementSystem.Metric,
            "kilogram",
            Measurement.MeasurementType.weight
        );

        assertEquals(Measurement.MeasurementSystem.Metric, measurement.getSystem());
        assertEquals("kilogram", measurement.getMeasurementName());
        assertEquals(Measurement.MeasurementType.weight, measurement.getMeasurementType());
    }
}
