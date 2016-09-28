/// <reference path="../_all.ts" />

'use strict';

module auroraApp.Filters {
    export function listFilter() {
        return (input, search) => {
            if (search.list == "all")
                return input
            
            let output = []
            input.forEach((item) => {
                if (item.tags.indexOf(search.list) > -1)
                    output.push(item)
            })

            return output
        }
    }

    export function vmFilter() {
        return (input, search) => {
            let output = []
            input.forEach((item) => {
                let pass = true
                search.filters.forEach((filter) => {
                    if (filter.type == "options") {
                        filter.options.forEach((option) => {
                            if (option.selected == false && item[filter.id] == option.term)
                                pass = false
                        })
                             
                    }
                    if (filter.type == "text") {
                        if (item[filter.id].toLowerCase().indexOf(filter.term.toLowerCase()) == -1)
                            pass = false
                    }
                })
                if (pass)
                    output.push(item)
            })

            return output
        }
    }
}

angular.module('auroraApp')
    .filter('listFilter', auroraApp.Filters.listFilter)
    .filter('vmFilter', auroraApp.Filters.vmFilter)