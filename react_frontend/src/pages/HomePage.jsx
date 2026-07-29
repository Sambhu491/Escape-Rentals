
import { useState } from "react";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import CityNavigation from "../components/landing/CityNavigation";
import CategoryNavigation from "../components/landing/CategoryNavigation";
import FeaturedProperties from "../components/landing/FeaturedProperties";
import Discover from "../components/landing/Discover";

const HomePage = () => {

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedCity, setSelectedCity] = useState("all");

    const resetFilters = () => {
        setSelectedCategory("all");
        setSelectedCity("all");
    };

    return (
        <>
        <Navbar/>
        
        <Discover/>
        
        <CityNavigation
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        />
        
        <Hero/>
        
        <CategoryNavigation
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        />

        <FeaturedProperties
        selectedCategory={selectedCategory}
        selectedCity={selectedCity}
        onResetFilter={resetFilters}
        />
        </>
    );
}

export default HomePage;
