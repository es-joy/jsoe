/*
const baseCategorySchema = z.object({
  name: z.string(),
  abc: z.union([z.string(), z.number()]),
  def: z.intersection(z.date(), z.number()).
        and(z.string()).and(z.array(z.never()))
});
const categorySchema = baseCategorySchema.extend({
  subcategories: z.object({
    children: z.lazy(() => categorySchema.array()),
  }),
});
*/
const unionsIntersectionsRecursion = {
  type: 'object',
  properties: {
    abc: {
      options: [
        {
          type: 'string'
        },
        {
          type: 'number'
        }
      ],
      type: 'union'
    },
    def: {
      left: {
        left: {
          left: {
            type: 'date'
          },
          right: {
            type: 'number'
          },
          type: 'intersection'
        },
        right: {
          type: 'string'
        },
        type: 'intersection'
      },
      right: {
        element: {
          type: 'never'
        },
        type: 'array'
      },
      type: 'intersection'
    },
    name: {
      type: 'string'
    },
    subcategories: {
      type: 'object',
      properties: {
        children: {
          element: {
            $ref: '#'
          },
          type: 'array'
        }
      }
    }
  }
};

export default unionsIntersectionsRecursion;
