import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import { createDeferredHandler } from '../helpers';

export default class VirtualList extends React.PureComponent {
    static propTypes = {
        itemSizes: PropTypes.array.isRequired,
        itemRenderer: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
        renderingRadius: PropTypes.number,
        outerRef: PropTypes.func,
        className: PropTypes.string,
        data: PropTypes.any,
        resizeKey: PropTypes.any,
    }

    static defaultProps = {
        renderingRadius: 3,
        className: '',
    }

    state = {
        startIndex: 0,
        stopIndex: -1,
    }

    get viewportHeight () {
        return this.topNode.getBoundingClientRect().height;
    }

    componentDidMount() {
        this.updateRenderedItems();
    }

    _prepareSpacialDataAndStyles = memoize(itemSizes => {
        const itemTops = new Array(itemSizes.length);
        const itemStyles = new Array(itemSizes.length);
        const contentHeight = itemSizes.reduce((sum, value, i) => {
            itemTops[i] = sum;
            itemStyles[i] = { position: 'absolute', top: sum + 'px' };
            sum += value;
            return sum;
        }, 0);
        return {itemTops, itemStyles, contentHeight};
    });

    get itemTops() {
        return this._prepareSpacialDataAndStyles(this.props.itemSizes).itemTops;
    }

    get contentHeight() {
        return this._prepareSpacialDataAndStyles(this.props.itemSizes).contentHeight;
    }

    get itemStyles() {
        return this._prepareSpacialDataAndStyles(this.props.itemSizes).itemStyles;
    }

    findItemIndexByScrollTop(scrollTop) {
        if (scrollTop <= 0) {
            return 0;
        }
        let left = 0;
        let right = this.itemTops.length - 1;
        let limit = 100;
        let count = 0;
        while (true) {
            if (++count > limit) {
                console.warn("Error in binary search");
                return left;
            }
            if (right === left) {
                return right;
            }
            const index = ((right - left) >> 1) + left;
            if (this.itemTops[index] <= scrollTop && this.itemTops[index + 1] > scrollTop) {
                return index;
            } else if (this.itemTops[index] < scrollTop) {
                left = index + 1;
            } else {
                right = index - 1;
            }
        }
    }

    updateRenderedItems = (viewportHeight = this.viewportHeight) => {
        this._firstScrollTimestamp = null;
        const scrollTop = this.topNode.scrollTop;
        const startIndex = this.findItemIndexByScrollTop(scrollTop - this.props.renderingRadius * viewportHeight);

        let stopIndex = startIndex;
        const stopThreshold = scrollTop + this.props.renderingRadius * viewportHeight;
        const maxIndex = this.itemTops.length - 1;
        for (; stopIndex < maxIndex; stopIndex++) {
            if (this.itemTops[stopIndex] >= stopThreshold) {
                break;
            }
        }

        this.setState({ startIndex, stopIndex });
    }

    onScroll = createDeferredHandler(() => this.updateRenderedItems());

    renderItems() {
        const { startIndex, stopIndex } = this.state;
        const items = new Array(stopIndex - startIndex + 1);
        const Item = this.props.itemRenderer;
        for (let i = startIndex; i <= stopIndex; i++) {
            items[i] = <Item
                index={i}
                style={this.itemStyles[i]}
                data={this.props.data ? this.props.data[i] : null}
                key={i}
            />;
        }
        return items;
    }

    ref = node => {
        this.topNode = node;
        this.props.outerRef && this.props.outerRef(node);
    }

    /**
     * A page is considered visible, if there is at least 25% of it is shown and it's at the top of the viewport (actual when there are many small pages, or a scale is small)
     * or if it takes more than 50% if the viewport (actual when there are bigger pages, the most common situation)
     */
    isItemVisible(index) {
        const scrollTop = this.topNode.scrollTop;
        const bottom = this.itemTops[index] + this.props.itemSizes[index];
        const viewportHeight = this.viewportHeight;
        return (
            (bottom - scrollTop >= 0.25 * this.props.itemSizes[index] && scrollTop >= this.itemTops[index])
            || (scrollTop >= this.itemTops[index] && (bottom - scrollTop) >= viewportHeight * 0.5)
            || (scrollTop < this.itemTops[index] && (this.itemTops[index] - scrollTop) < viewportHeight * 0.5)
        );
    }

    getCurrentVisibleItemIndex() {
        const index = this.findItemIndexByScrollTop(this.topNode.scrollTop);
        if (!this.isItemVisible(index) && (index + 1 < this.itemTops.length)) {
            return index + 1;
        } else {
            return index;
        }
    }

    scrollToItem(index) {
        this.topNode.scrollTop = this.itemTops[index];
    }

    render() {
        //console.log('RENDER', Date.now());
        return (
            <div
                ref={this.ref}
                className={"virtual_list " + this.props.className}
                onScroll={this.onScroll}
            >
                <div style={{ height: this.contentHeight + 'px' }}>
                    {this.renderItems()}
                </div>
            </div>
        );
    }
}