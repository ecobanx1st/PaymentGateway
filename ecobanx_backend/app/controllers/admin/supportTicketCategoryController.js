const { SupportTicketCategory } = require("../../models/supportTicketCategoryModel");

const createCategory = async (req, reply) => {
  try {
    const { name, description, isActive } = req.validatedData;

    const exists = await SupportTicketCategory.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (exists) {
      return reply.code(409).send({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = await SupportTicketCategory.create({ name, description, isActive });

    return reply.code(201).send({
      success: true,
      message: "Category created successfully",
      result: category,
    });
  } catch (error) {
    console.error("createCategory error:", error);
    return reply.code(500).send({
      success: false,
      message: "Error creating category",
    });
  }
};
const getCategories = async (req, reply) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
    } = req.query;

    const filter = {};

    // Search by category name
    if (search?.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    // Filter by active status
    if (isActive !== undefined && isActive !== "") {
      filter.isActive = isActive === "true";
    }

    const pageNum = Math.max(
      1,
      parseInt(page, 10) || 1
    );

    const limitNum = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 20)
    );

    const options = {
      page: pageNum,
      limit: limitNum,
      sort: {
        createdAt: -1,
      },
      lean: true,
    };

    const result = await SupportTicketCategory.paginate(
      filter,
      options
    );

    return reply.code(200).send({
      success: true,
      message: "Categories fetched successfully",
      result: {
        categories: result.docs,

        pagination: {
          total: result.totalDocs,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
          nextPage: result.nextPage,
          prevPage: result.prevPage,
        },
      },
    });
  } catch (error) {
    console.error("getCategories error:", error);

    return reply.code(500).send({
      success: false,
      message: "Error fetching categories",
    });
  }
};


const getCategoryById = async (req, reply) => {
  try {
    const category = await SupportTicketCategory.findById(req.params.id).lean();
    if (!category) {
      return reply.code(404).send({
        success: false,
        message: "Category not found",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Category fetched successfully",
      result: category,
    });
  } catch (error) {
    console.error("getCategoryById error:", error);
    return reply.code(500).send({
      success: false,
      message: "Error fetching category",
    });
  }
};

const updateCategory = async (req, reply) => {
  try {
    const { name, description, isActive } = req.validatedData;

    if (name) {
      const duplicate = await SupportTicketCategory.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: `^${name}$`, $options: "i" },
      });
      if (duplicate) {
        return reply.code(409).send({
          success: false,
          message: "Category with this name already exists",
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await SupportTicketCategory.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return reply.code(404).send({
        success: false,
        message: "Category not found",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Category updated successfully",
      result: category,
    });
  } catch (error) {
    console.error("updateCategory error:", error);
    return reply.code(500).send({
      success: false,
      message: "Error updating category",
    });
  }
};

const deleteCategory = async (req, reply) => {
  try {
    const { SupportTicket } = require("../../models/userSupportTicket");

    const ticketCount = await SupportTicket.countDocuments({ category: req.params.id });
    if (ticketCount > 0) {
      return reply.code(400).send({
        success: false,
        message: `Cannot delete category. ${ticketCount} ticket(s) are using this category. Deactivate it instead.`,
      });
    }

    const category = await SupportTicketCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return reply.code(404).send({
        success: false,
        message: "Category not found",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("deleteCategory error:", error);
    return reply.code(500).send({
      success: false,
      message: "Error deleting category",
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
