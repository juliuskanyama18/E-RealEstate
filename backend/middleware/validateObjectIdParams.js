import mongoose from "mongoose";

// A malformed value in an :id-style route param (e.g. a truncated or
// hand-typed URL) throws a Mongoose CastError deep in whatever query uses
// it, which every controller's generic catch turns into a bare 500. This
// stops that at the door with a clean 400 instead.
//
// Registered via router.param(name, ...), not router.use(...) — a blanket
// router.use() runs before Express matches the specific route pattern, so
// req.params is still empty at that point. router.param() fires exactly
// when a route containing that named segment is matched, whichever route
// it is, without needing to be added to each route individually.
export const validateObjectIdParam = (req, res, next, value, name) => {
  if (!mongoose.isValidObjectId(value)) {
    return res.status(400).json({ success: false, message: `Invalid ${name}` });
  }
  next();
};

// Registers the validator for every param name in the list, e.g.
// registerObjectIdParams(router, ['id', 'leaseId', 'docId']).
export const registerObjectIdParams = (router, names) => {
  for (const name of names) router.param(name, validateObjectIdParam);
};
