// can use this query for search sub business with main category
[
    {
      $search: {
        index: "businessCategory",
        text: {
          path: ["code", "name"],
          query: "Nid NoI",
          score: {
            boost: {
              value: 1,
            },
          },
        },
      },
    },
    {
      $match: {
        is_active: true,
        is_deleted: false,
        master_uuid:
          "e9c107ca-32e9-4e01-9642-5e355edemock",
        type: "sub_business_category",
      },
    },
    {
      $group: {
        _id: null,
        sub_category: {
          $push: "$$ROOT",
        },
        total_count: {
          $sum: 1,
        },
      },
    },
    {
      $lookup: {
        from: "subCateOutOfMainCate",
        localField: "sub_category.master_uuid",
        foreignField: "uuid",
        as: "business_category_detail",
      },
    },
    {
      $project: {
        business_category_detail: {
          $arrayElemAt: [
            "$business_category_detail",
            0,
          ],
        },
        total_count: 1,
        results: {
          $slice: ["$sub_category", 0, 10],
        },
      },
    },
  ]