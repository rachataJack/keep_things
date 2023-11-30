[
  {
    $search: {
      index: "businessCategory",
      text: {
        query: "AC Cleaning",
        path: "name",
      },
    },
  },
  {
    $match: {
      is_deleted: false,
      is_active: true,
    },
  },
  {
    $skip: 10,
  },
  {
    $limit: 10,
  },
]