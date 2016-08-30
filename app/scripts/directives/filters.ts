/// <reference path="../_all.ts" />

'use strict';

module auroraApp.Filters {
    export function listFilter() {
        return (input, search) => {
            if (search.list == "all")
                return input
            
            let output = []
            input.forEach((item) => {
                if (item.lists.indexOf(search.list) > -1)
                    output.push(item)
            })

            return output
        }
    }
}

angular.module('auroraApp')
    .filter('listFilter', auroraApp.Filters.listFilter)