package com.recipe.controller;

import com.recipe.model.Measurement;
import com.recipe.repository.MeasurementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/measurements")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class MeasurementController {

    @Autowired
    private MeasurementRepository measurementRepository;

    @GetMapping
    public ResponseEntity<List<Measurement>> getAllMeasurements() {
        List<Measurement> measurements = measurementRepository.findAll();
        return ResponseEntity.ok(measurements);
    }

    @GetMapping("/system/{system}")
    public ResponseEntity<List<Measurement>> getMeasurementsBySystem(
            @PathVariable Measurement.MeasurementSystem system) {
        List<Measurement> measurements = measurementRepository.findBySystem(system);
        return ResponseEntity.ok(measurements);
    }

    @GetMapping("/system/{system}/type/{type}")
    public ResponseEntity<List<Measurement>> getMeasurementsBySystemAndType(
            @PathVariable Measurement.MeasurementSystem system,
            @PathVariable Measurement.MeasurementType type) {
        List<Measurement> measurements = measurementRepository.findBySystemAndMeasurementType(system, type);
        return ResponseEntity.ok(measurements);
    }
}