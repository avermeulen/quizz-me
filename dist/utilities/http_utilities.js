exports.reportErrors = function (req, errors) {
    var fields = {};
    errors.forEach((error) => fields[error.param] = true);
    req.flash('messages', errors);
    req.flash('type', 'alert-error');
    req.flash('errorFields', fields);
    req.flash('fields', req.body);
};
//# sourceMappingURL=http_utilities.js.map