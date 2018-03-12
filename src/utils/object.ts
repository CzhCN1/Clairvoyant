export class ObjectUtils {
    /**
     * 获取对象的具体属性 支持objct.a.b.c
     * 
     * @param {*} parentObj 目标对象
     * @param {string} field 具体属性名
     * @returns {*} 属性值
     * @memberof ObjectUtils
     */
    public getParamFromObject(parentObj: any, field: string): any { 
        if (parentObj && field) {
            if (field.indexOf('.') == -1) {
                return parentObj[field];
            } else {
                let fields = field.split('.');
                let value = parentObj;
                for (let i = 0, len = fields.length; i < len; ++i) {
                    if (value == null) {
                        return null;
                    }
                    value = value[fields[i]];
                }
                return value;
            }
        } else {
            return null;
        }
    }
}
