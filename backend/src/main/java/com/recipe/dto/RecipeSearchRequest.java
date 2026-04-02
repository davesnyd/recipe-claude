package com.recipe.dto;

import java.time.LocalDateTime;

public class RecipeSearchRequest {
    private String title;
    private String description;
    private String note;
    private String createUsername;
    private Boolean isPublic;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String ingredient;
    private String category;
    private String cuisine;
    private String holiday;
    private String course;
    private String type;

    // Constructors
    public RecipeSearchRequest() {}

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getCreateUsername() { return createUsername; }
    public void setCreateUsername(String createUsername) { this.createUsername = createUsername; }

    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public String getIngredient() { return ingredient; }
    public void setIngredient(String ingredient) { this.ingredient = ingredient; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }

    public String getHoliday() { return holiday; }
    public void setHoliday(String holiday) { this.holiday = holiday; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}