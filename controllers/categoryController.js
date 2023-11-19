const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");

const loadAddCategory = asyncHandler(async (req, res) => {
    try {
        res.render("add-Category", { Message: "" });
    } catch (error) {
        console.error("Error");
    }
});

const createCategory = asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        const image = req.file.filename;
        if (!description && name) {
            res.render("add-Category", { Message: "Field is required" });
        }

        const categoryExist = await Category.findOne({ name });
        if (categoryExist) {
            return res.render("add-Category", { Message: "Category already exists" });
        }

        const newCategory = new Category({ name, description, image });
        console.log(newCategory);
        await newCategory.save();
        res.render("add-Category", { Message: "Category Successfully Added" });
    } catch (error) {
        console.error("Error");
    }
});

const viewCategory = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 3;

        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / perPage);

        const viewcategory = await Category.find()
            .skip((page - 1) * perPage)
            .limit(perPage);
        console.log(viewCategory);
        res.render("category-List", { viewcategory, currentPage: page, totalPages });
    } catch (error) {
        console.error(error);
    }
});

const listCategory = asyncHandler(async (req, res) => {
    try {
        const categoryId = req.query.id;
        const listcategory = await Category.findByIdAndUpdate(categoryId, { status: true }, { new: true });
        if (listcategory) {
            res.redirect("/admin/viewCategory");
        }
    } catch (error) {
        console.error("Error");
    }
});

const unListCategory = asyncHandler(async (req, res) => {
    try {
        const categoryId = req.query.id;
        const unlistcategory = await Category.findByIdAndUpdate(categoryId, { status: false }, { new: true });
        if (unlistcategory) {
            res.redirect("/admin/viewCategory");
        }
    } catch (error) {
        console.error("Error");
    }
});

const editCategory = asyncHandler(async (req, res) => {
    try {
        const categoryId = req.query.id;
        console.log(categoryId);
        const categoryData = await Category.findById(categoryId);
        res.render("edit-Category", { categoryData, Message: "" });
    } catch (error) {
        res.render("404")
    }
});

const updateCategory = asyncHandler(async (req, res) => {
    try {
        const { id, name, description } = req.body;
        const image = req.file ? req.file.filename : null;
        const updateFields = { name, description };
        if (image) {
            updateFields.image = image;
        }

        // Find the category being edited
        const categoryData = await Category.findById(id);

        // Check for other categories with the same name, excluding the current category being edited
        const categoryExist = await Category.findOne({ name, _id: { $ne: id } });

        if (categoryExist) {
            return res.render("edit-Category", { categoryData, Message: "Category already exists" });
        }

        const updatedCategory = await Category.findByIdAndUpdate(id, updateFields, { new: true });
        res.redirect("/admin/viewCategory");
    } catch (error) {
        console.log("Error occurred in categoryController editCategory function", error);
    }
});


module.exports = {
    loadAddCategory,
    createCategory,
    viewCategory,
    listCategory,
    unListCategory,
    editCategory,
    updateCategory,

};
