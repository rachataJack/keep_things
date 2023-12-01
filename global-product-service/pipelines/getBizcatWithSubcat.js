[
  // looking for similar word
  {
    $search: {
      index: "businessCategory",
      text: {
        path: ["code", "name"],
        query: "clean",
        score: {
          boost: {
            value: 1,
          },
        },
      },
    },
  },
  {
    $project: {
      _id: 1,
      uuid: 1,
      code: 1,
      name: 1,
      description: 1,
      created_date: 1,
      created_by: 1,
      updated_date: 1,
      updated_by: 1,
      is_active: 1,
      is_deleted: 1,
      UpdatedBy: 1,
      UpdatedDate: 1,
      type: 1,
      master_uuid: 1,
      score: {
        $meta: "searchScore",
      },
    },
  },

  // remove delete, non-activate docs
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
  
  // prepare uuid, score of sub-cate that doesnt have their master by stage search (anyway they master must be in the collection!)
  {
    $addFields: {
      uuid_sub_categories_without_master: {
        $filter: {
          input:
            "$sub_business_category.master_uuid",
          as: "subMasterUUID",
          cond: {
            $not: {
              $in: [
                "$$subMasterUUID",
                "$business_category.uuid",
              ],
            },
          },
        },
      },
      score_sub_categories_without_master: {
        $map: {
          input: {
            $filter: {
              input: "$sub_business_category",
              as: "subMasterUUID",
              cond: {
                $not: {
                  $in: [
                    "$$subMasterUUID.master_uuid",
                    "$business_category.uuid",
                  ],
                },
              },
            },
          },
          as: "matchedCategory",
          in: "$$matchedCategory.score",
        },
      },
    },
  },

  // looking for masters~~
  {
    $lookup: {
      from: "way3-mixInOneColl",
      localField:
        "uuid_sub_categories_without_master",
      foreignField: "uuid",
      as: "matched_master_categories",
    },
  },

  // inject score to masters
  {
    $addFields: {
      matched_master_categories: {
        $map: {
          input: {
            $zip: {
              inputs: [
                "$matched_master_categories",
                "$score_sub_categories_without_master",
              ],
            },
          },
          as: "pair",
          in: {
            $mergeObjects: [
              {
                $arrayElemAt: ["$$pair", 0],
              },
              {
                score: {
                  $arrayElemAt: ["$$pair", 1],
                },
              },
            ],
          },
        },
      },
    },
  },

  // may be masters have another sub-cate that didnt found by stage search. lets looking for them
  {
    $lookup: {
      from: "way3-mixInOneColl",
      localField:
        "uuid_sub_categories_without_master",
      foreignField: "master_uuid",
      as: "matched_sub_categories",
    },
  },

  // append the 'come late category' into their type
  {
    $project: {
      business_category: {
        $concatArrays: [
          "$business_category",
          "$matched_master_categories",
        ],
      },
      sub_business_category: {
        $setUnion: [
          "$sub_business_category",
          {
            $map: {
              input: "$matched_sub_categories",
              as: "matched_sub_categories",
              in: {
                $cond: {
                  if: {
                    $not: {
                      $in: [
                        "$$matched_sub_categories.uuid",
                        "$sub_business_category.uuid",
                      ],
                    },
                  },
                  then: "$$matched_sub_categories",
                  else: null,
                },
              },
            },
          },
        ],
      },
    },
  },

  // structuring mongo documents suit to API
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
  
  // the 'late come category' may cause ordering incorrect. sort score for sure
  {
    $sort: {
      score: -1,
    },
  },

  // doing pagination
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
        $slice: [
          "$results",
          {
            $subtract: [0, 10],
          },
          10,
        ],
      },
    },
  },
]