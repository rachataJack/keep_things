[
    // looking for similar word
  {
    $search: {
      index: "businessCategory",
      text: {
        path: ["code", "name"],
        query: "Ceiling Instellmeqt",
      },
    },
  },
  // filter deleted out
  {
    $match: {
      is_active: true,
      is_deleted: false,
    },
  },
  {
    $facet: {
      business_category: [
        {
          $match: {
            type: "business_category",
          },
        },
      ],
      sub_business_category: [
        {
          $match: {
            type: "sub_business_category",
          },
        },
      ],
    },
  },
  {
    $unwind: "$business_category",
  },
  {
    $addFields: {
      business_category: {
        $mergeObjects: [
          "$business_category",
          {
            sub_business_category: {
              $filter: {
                input: "$sub_business_category",
                as: "sub",
                cond: {
                  $eq: [
                    "$$sub.master_uuid",
                    "$business_category.uuid",
                  ],
                },
              },
            },
          },
        ],
      },
    },
  },
  {
    $replaceRoot: {
      newRoot: "$business_category",
    },
  },
  {
    $group: {
      _id: null,
      total_count: {
        $sum: 1,
      },
      results: {
        $push: "$$ROOT",
      },
    },
  },
  {
    $project: {
      _id: 0,
      total_count: 1,
      results: {
        $slice: ["$results", 0, 10],
      },
    },
  },
]