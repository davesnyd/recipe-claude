package com.recipe.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "measurements")
public class Measurement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "measurement_id")
    private Long measurementId;

    @NotNull
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MeasurementSystem system;

    @NotBlank
    @Column(name = "measurement_name", nullable = false)
    private String measurementName;

    @NotNull
    @Column(name = "measurement_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private MeasurementType measurementType;

    public enum MeasurementSystem {
        Imperial, Metric
    }

    public enum MeasurementType {
        weight, volume
    }

    // Constructors
    public Measurement() {}

    public Measurement(MeasurementSystem system, String measurementName, MeasurementType measurementType) {
        this.system = system;
        this.measurementName = measurementName;
        this.measurementType = measurementType;
    }

    // Getters and Setters
    public Long getMeasurementId() { return measurementId; }
    public void setMeasurementId(Long measurementId) { this.measurementId = measurementId; }

    public MeasurementSystem getSystem() { return system; }
    public void setSystem(MeasurementSystem system) { this.system = system; }

    public String getMeasurementName() { return measurementName; }
    public void setMeasurementName(String measurementName) { this.measurementName = measurementName; }

    public MeasurementType getMeasurementType() { return measurementType; }
    public void setMeasurementType(MeasurementType measurementType) { this.measurementType = measurementType; }
}