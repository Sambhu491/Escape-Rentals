import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingPage from "../loading/LoadingPage/LoadingPage";
import {
  fetchCategories,
  selectAllCategories,
  selectCategoryStatus,
  selectCategoryError,
} from "../../redux/category/categorySlice";

const CategoryNavigation = ({
    selectedCategory,
    onCategoryChange,
}) => {
  const dispatch = useDispatch();

  const categories = useSelector(selectAllCategories);
  const status = useSelector(selectCategoryStatus);
  const error = useSelector(selectCategoryError);


  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCategories());
    }
  }, [dispatch, status]);

  const handleCategoryClick = (category) => {
    onCategoryChange(category.id);

    /*
      Later connect property redux here:
      dispatch(fetchPropertiesByCategory(category.id));
    */
  };

  const handleAllClick = () => {
    onCategoryChange("all");
    // dispatch(fetchAllProperties());
  };

  if (status === "loading") {
    return (
      <section className="w-full py-6">
        <div className="flex justify-center">
          <LoadingPage
            variant="dots"
            size="xs"
            color="bg-slate-700"
            spinnerColor="red"
          />
        </div>
      </section>
    );
  }

  if (status === "failed") {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <section className="w-full bg-white border-b border-gray-200">
      <div className="mx-auto max-w-screen-2xl">
        <div
          className="flex items-center md:justify-center gap-2 sm:gap-2 md:gap-4
          overflow-x-auto no-scrollbar mx-3 md:mx-2 lg:mx-1
          py-3 sm:py-2 scroll-smooth"
        >
          <button
            onClick={handleAllClick}
            className={`flex flex-col items-center
              justify-center flex-shrink-0 min-w-[50px]
              sm:min-w-[58px] md:min-w-[66px] lg:min-w-[74px]
              gap-1 cursor-pointer
              border-b-2 transition duration-200
              ${
                selectedCategory === "all"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }
            `}
          >
            <span className="text-sm font-medium whitespace-nowrap">All</span>
          </button>

          {categories
            .filter((category) => category.active)
            .map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`flex flex-col items-center
                  justify-center flex-shrink-0 min-w-[60px] 
                  sm:min-w-[68px] md:min-w-[76px] lg:min-w-[84px] 
                  gap-1 border-b-2 px-2
                  cursor-pointer
                  transition duration-200
                  ${
                    selectedCategory === category.id
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }
          `}
              >
                <span className="text-sm font-medium whitespace-nowrap">
                  {category.name}
                </span>
              </button>
            ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryNavigation;
