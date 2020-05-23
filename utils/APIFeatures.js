module.exports = class {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        //Build Simple Query
        const queryObj = { ...this.queryString };
        const excludedFields = ['sort', 'limit', 'page', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);
        //Build advanced query
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        //Sort
        if (this.queryString.sort) {
            // console.log(this.queryString);
            const sortBy = this.queryString.sort.split(',').join(' ');
            // console.log(sortBy);
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    select() {
        //Select
        if (this.queryString.fields) {
            const selectFielids = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(selectFielids);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        //Pagination
        //?page=1&limit=5
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
};
