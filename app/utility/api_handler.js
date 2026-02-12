module.exports = {
    JsonMsg: (state, data, msg, code) => {
        let result;
        if (data != null) {
            result = {
                success: state,
                data: data,
                message: msg,
                successCode: code,
            }
        } else {
            result = {
                success: state,
                message: msg,
                errorCode: code,
            }
        }
        return result;
    }
}
