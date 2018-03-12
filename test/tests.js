var expect = chai.expect; 

describe('Common类 getStorage方法测试', function() {
    describe('#getStorage()', function(){
        before(function() {
            localStorage.setItem('phoneNumber', '18829027652');
        })
        var commonService = new monitor.Common();
        var result = commonService.getStorage(['phoneNumber']);
        it('返回值类型测试', function() {
            expect(result).to.be.a('array');
        });
    
        it('返回值长度测试', function() {
            expect(result).to.have.lengthOf(1);
        })
    
        it('返回值结果正确性测试', function() {
            expect(result[0]).have.property('value').with.equal('18829027652');
        })
    })
});



describe('Http类 getRequest方法测试', function() {
    var httpService = new monitor.Http();
    it('Get请求测试1', (done) => {
        var url = 'https://d.quyiyuan.com:8091/kyee_nextframework_fisheye/config/qureyConfig.next?appId=a9e77e4a13ab503e9a3165cd88f1263f';
        httpService.getRequest(url)
            .then((res) => {
                var result = res && JSON.parse(res);
                expect(result.success).to.equal(true);
                done();
            });
    });

    it('Get请求测试2', function() {
        var url = 'https://d.quyiyuan.com:8091/kyee_nextframework_fisheye/config/qureyConfig.next?appId=a9e77e4a13ab503e9a3165cd88f1263f';
        return httpService.getRequest(url).then((res) => {
            var result = res && JSON.parse(res);
            expect(result.success).to.equal(true);
        });
    });
});
