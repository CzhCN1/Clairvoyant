import { Common } from './../src/utils/common';
import { expect } from 'chai';
import 'mocha';

const commonService = new Common();
describe('Common类 appIDCheck方法测试', () => {
    it('appId=\'378bd9334d5657d78942341fb7c60df3\' 应该返回true', () => {
        expect(commonService.appIDCheck('378bd9334d5657d78942341fb7c60df3')).to.equal(true);
    });
    it('appId=\'123123\' 应该返回false', () => {
        expect(commonService.appIDCheck('123123')).to.equal(false);
    });
    it('appId=\'abcd123_*@#\' 应该返回false', () => {
        expect(commonService.appIDCheck('abcd123_*@#')).to.equal(false);
    });
    it('appId=\'\' 应该返回false', () => {
        expect(commonService.appIDCheck('')).to.equal(false);
    });
});
