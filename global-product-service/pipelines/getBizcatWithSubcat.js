[
  // looking for similar field
  {
    $search: {
      index: "businessCategory",
      text: {
        path: ["code", "name"],
        query: "clean",
      },
    },
  },
  // remove delete, not-activate docs
  {
    $match: {
      is_active: true,
      is_deleted: false,
    },
  },
  // why should i doing rank?
  // bcuz when the 1st stage (searching stage) found the sub-category
  // but not found the main-category (which it's correct: Sub-category names don't need to be the same as their main category)
  //
  // so i try to use this solution
  // i use the field 'master_uuid' of sub-cat to looking-up whole collection
  //
  // -->> the issue is here
  // When obtaining the main category, how can I determine the correct position for it within another main categories?
  // so i rank all doc i have found from 2 stage before
  // and then after i compound main-cate and sub-cate into correct object i will sort it by 'rank'
  //
  
  // prepare rank - step 1: convert input docs to single object with field 'documents'
  {
    $group: {
      _id: null,
      documents: {
        $push: "$$ROOT",
      },
    },
  },
  // prepare rank - step 2: so i can create array field 'rank'
  {
    $addFields: {
      rank: {
        $map: {
          input: {
            $range: [
              0,
              {
                $size: "$documents",
              },
            ],
          },
          as: "index",
          in: {
            $add: [0, "$$index"],
          },
        },
      },
    },
  },
  // prepare rank - step 3: inject field 'rank' to each doc in 'documents'
  {
    $addFields: {
      documents: {
        $map: {
          input: {
            $zip: {
              inputs: ["$documents", "$rank"],
            },
          },
          as: "pair",
          in: {
            $mergeObjects: [
              {
                $arrayElemAt: ["$$pair", 0],
              },
              {
                rank: {
                  $arrayElemAt: ["$$pair", 1],
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    $unwind: "$documents",
  },
  {
    $project: {
      _id: 0,
      documents: 1,
    },
  },
  // prepare rank - DONE

  // Get the main-cate that stage search not found
  // Get the main-cate - Step 1: Identify sub-categories where the master_uuid does not match any other main-category uuid.
  {
    $replaceRoot: {
      newRoot: "$documents",
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
  // Get the main-cate - Step 2: prepare arrays for inject to main cate
  {
    $addFields: {
      // prepare diff uuid for seeking in whole collection
      differented_uuid: {
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
      // prepare the sub-cate rank for inject to main-cate after found it
      differented_rank: {
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
          in: "$$matchedCategory.rank",
        },
      },
    },
  },
  
  // Get the main-cate - Step 3: lookup whole collection
  {
    $lookup: {
      from: "way3-mixInOneColl",
      localField: "differented_uuid",
      foreignField: "uuid",
      as: "matched_docs",
    },
  },
  // Get the main-cate - Step 4: inject rank into main-cate
  {
    $addFields: {
      matched_docs: {
        $map: {
          input: {
            $zip: {
              inputs: [
                "$matched_docs",
                "$differented_rank",
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
                rank: {
                  $arrayElemAt: ["$$pair", 1],
                },
              },
            ],
          },
        },
      },
    },
  },
  // Get the main-cate - DONE

  // Start building the expected result before send to API
  // append that main-cate to main array -> business_category
  // how to say it in go: business_category = append(business_category, matching_docs)
  {
    $addFields: {
      business_category: {
        $concatArrays: [
          "$business_category",
          "$matched_docs",
        ],
      },
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
  // the rank that prepared before is using here~
  {
    $sort: {
      rank: 1,
    },
  },
  // pagination
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