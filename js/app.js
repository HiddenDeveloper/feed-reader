'use strict';

var App = angular.module('RSSFeedApp', ['firebase']);

App.factory('FeedService',['$http',function($http){
    return {
        parseFeed : function(url){
            return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=9&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
        }
    }
}]);

// var myFeeds =  [
//                 { id: '1', first: 'true', next: '2', feedsrc: 'http://feeds2.feedburner.com/dwahlin', col: 1 },
//                 { id: '2', next: '3', feedsrc: 'http://feeds.feedburner.com/LosTechies', col: 1 },
//                 { id: '3', next: '4', feedsrc: 'http://feeds.feedburner.com/teamtreehouse', col: 2 },
//                 { id: '4', next: '5', feedsrc: 'http://rss1.smashingmagazine.com/feed/', col: 1 },
//                 { id: '5', next: '6', feedsrc: 'http://www.alvinashcraft.com/feed', col: 0 },
//                 { id: '6', next: '7', feedsrc: 'http://www.theregister.co.uk/headlines.atom', col: 1 }, 
//                 { id: '7', next: '8', feedsrc: 'http://feeds.abdullin.com/RinatAbdullin', col: 2 },
//                 { id: '8', next: '9', feedsrc: 'http://beingtheworst.com/feed', col: 0 },
//                 { id: '9', next: '10', feedsrc: 'http://omaralzabir.com/feed/', col: 1 },
//                 { id: '10', next: '11', feedsrc: 'http://feeds.feedburner.com/userinexperience/tYGT', col: 2 },
//                 { id: '11', next: '12', feedsrc: 'http://addyosmani.com/blog/feed/', col: 0 },
//                 { id: '12', next: '13', feedsrc: 'http://domaindrivendesign.org/rss.xml', col: 1 },
//                 { id: '13', next: '14', feedsrc: 'http://www.bitcandies.com/blog/feed/', col: 2},
//                 { id: '14', next: '15', feedsrc: 'http://feeds.haacked.com/haacked', col: 0 },
//                 { id: '15', next: '16', feedsrc: 'http://feeds.feedburner.com/AyendeRahien', col: 1 },
//                 { id: '16', next: '17', feedsrc: 'http://blogs.msdn.com/ie/rss.xml', col: 2 },
//                 { id: '17', next: '18', feedsrc: 'http://blog.stevensanderson.com/feed/', col: 0 },
//                 { id: '18', next: '19', feedsrc: 'http://feeds.feedburner.com/cqrs-info', col: 1 },
//                 { id: '19', next: '20', feedsrc: 'http://weblogs.asp.net/scottgu/Rss.aspx', col: 2 },
//                 { id: '20', next: '21', feedsrc: 'http://www.cssplay.co.uk/feed.xml', col: 0 },
//                 { id: '21', next: '22', feedsrc: 'http://newsrss.bbc.co.uk/rss/newsonline_world_edition/front_page/rss.xml', col: 1 },
//                 { id: '22', next: '23', feedsrc: 'http://www.codeproject.com/webservices/articlerss.aspx?cat=1', col: 2 },
//                 { id: '23', next: null, feedsrc: 'http://thebrandbuilder.wordpress.com/feed/', col: 0 }
//             ];


App.directive("feedreader", function () {


    return {

        controller: function($scope, $firebase) {

            var ref = new Firebase('https://intense-heat-5803.firebaseio.com/myfeeds'); 

            var fb = $firebase(ref);
            $scope.myFeeds = fb.$asArray();

            $scope.AddFeed = function() {
                var feed = {
                    col: 0,
                    feedsrc: $scope.newFeed
                };        

                if($scope.newFeed !== undefined) {

                    $scope.myFeeds.$add(feed);
                } 

                $scope.newFeed = undefined; 

            };

            $scope.DeleteFeed = function(feed) {
                
                var index = $scope.myFeeds.indexOf( feed );                
 
                if ( index === -1 ) {
                    return;
                }

                $scope.myFeeds.$remove( index );
            }

            $scope.handleDrop = function() {
                alert('Item has been dropped');
            }

            $scope.sortFeeds = function(feed) {
                var idx = $scope.myFeeds.indexOf(feed);
                return $scope.myFeeds[idx].idx;
            };
        },
        restrict: 'E',
        replace: true,
        templateUrl: 'views/feedreader.html'
    }
});

var dropSpacer = null;

App.directive('feedreadercolumn', function() {

    var i = 0;

    function getDraggedOverItem(limit, el, c) {

        if(el === limit) {
            return null;
        }

        if(el.classList.contains(c)) {
            return el;
        }

        return getDraggedOverItem(limit, el.parentNode, c);
    }

    return {
        controller :  function($scope) {
            $scope.idx = i++;
        },
        link: function(scope, element) {

            var el = element[0],
                firstChild = el.firstChild,
                getDropIndex = function(node) {
                    var i = 0;
                    while (node = node.previousSibling) {
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('dragTarget') === true) { 
                            ++i; 
                        }
                    }
                    return i;
                }

            el.droppable = true;
            
            el.addEventListener(
                'dragenter',
                function(e) {

                    var t;

                    if(dropSpacer === null) {
                        dropSpacer = document.createElement('DIV');
                        dropSpacer.className = 'dropSpacer';
                    }

                    if(el.querySelectorAll('.dragTarget').length === 0) {
                        if(el.querySelector('.dropSpacer') === null) {
                            scope.dropIndex = -1;
                            el.appendChild(dropSpacer);
                        }
                    } else {
                        t = getDraggedOverItem(el, e.target, 'dragTarget');
                        if(t) {
                            if(t.previousSibling !== dropSpacer) {
                                scope.dropIndex = getDropIndex(t);
                                el.insertBefore(dropSpacer, t);
                            }
                        }
                    }

                    e.preventDefault();
                    return true;
                },
                false
            );

            el.addEventListener(
                'dragover',
                function(e) {
                    if(e.target === dropSpacer) {
                         e.preventDefault();
                    }                   
                },
                false
            );

            el.addEventListener(
                'drop',
                function(e) {

                    var p = scope,
                        feeds = p.$parent.myFeeds,
                        sourceIdx = e.dataTransfer.getData("SourceIdx"),
                        sourceFeed = feeds[sourceIdx],
                        i = 0,
                        x = scope.dropIndex + 1,
                        l = p.myFeeds.length,
                        targetIdx = l,
                        targetFeed;

                    // Set sourceFeed
                    sourceFeed.idx = (scope.dropIndex === -1) ? 0 : scope.dropIndex;
                    sourceFeed.col = scope.$index;
                    feeds.$save(sourceFeed);
  
                    // update other feeds if exist
                    if(scope.dropIndex !== -1) {
                        for(i=0; i<l; i++) {
                            if(feeds[i].col === scope.$index) { 
                                targetFeed = feeds[i];                          
                                if(targetFeed !== sourceFeed && targetFeed.idx >= sourceFeed.idx ) {
                                    targetFeed.idx = x++;
                                    feeds.$save(targetFeed);
                                }
                            }
                        }
                    }

                    e.stopPropagation();
                    return false;
                },
                false
            );
        },
        restrict: 'A'
    }

});

App.directive("toolbar", function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/toolbar.html'
    }
});

App.directive("feed", function () {

    return {
        transclude: false,
        controller :  function($scope, FeedService) {
            FeedService.parseFeed($scope.feed.feedsrc).then(function(res){
                if(res.data.responseStatus === 200) {
                    $scope.feeddata = res.data.responseData.feed;
                } else {
                    $scope.DeleteFeed($scope.feed);
                }    
            });

            $scope.myIdx = $scope.$parent.myFeeds.indexOf($scope.feed);

            $scope.DeleteFeed = function(feed) {
                $scope.$parent.DeleteFeed(feed);
            };
        },
        link: function(scope, element) {

            var el = element[0];

            el.draggable = true;

            el.addEventListener(
                'dragstart',
                function(e) {
                    var p = scope.$parent,
                        idx = p.myFeeds.indexOf(scope.feed);

                    e.dataTransfer.effectAllowed='move';
                    e.dataTransfer.setData("SourceIdx", idx); 
                    e.dataTransfer.setDragImage(e.target,100,30);
                    return true;
                },
                false
            );

            el.addEventListener(
                'dragend',
                function(e) {
                    if(dropSpacer !== null) {
                        dropSpacer.parentNode.removeChild(dropSpacer);
                        dropSpacer = null;
                    }
                },
                false
            );

        },
        restrict: 'E',
        replace: true,
        templateUrl: 'views/feed.html'
    }
});