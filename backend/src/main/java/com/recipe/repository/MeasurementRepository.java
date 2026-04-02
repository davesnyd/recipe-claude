package com.recipe.repository;

import com.recipe.model.Measurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MeasurementRepository extends JpaRepository<Measurement, Long> {
    List<Measurement> findBySystem(Measurement.MeasurementSystem system);
    List<Measurement> findBySystemAndMeasurementType(
        Measurement.MeasurementSystem system, 
        Measurement.MeasurementType measurementType
    );
    Optional<Measurement> findByMeasurementName(String measurementName);
    List<Measurement> findAllByMeasurementName(String measurementName);
    Optional<Measurement> findFirstByMeasurementName(String measurementName);
}