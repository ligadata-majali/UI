describe('Testing AngularJS Test Suite', function(){
    beforeEach(module('kmapp'));
    describe('Testing AngularJS Controller', function () {
        var scope;
        var ctrl;
        beforeEach(inject(function($controller,$rootScope) {
            scope = $rootScope.$new();
            ctrl = $controller('mainCtrl', {$scope:scope});
        }));
        it('should initialize the title in the scope', function() {
            var scope;
            var ctrl;
            expect(scope.filterName).toBeDefined();
            expect(scope.filterName).toBe("active");
        });
    });
});