import { h, Component, render } from 'preact';
import { act } from 'preact/test-utils';
import TransitionGroup from '../src';
import { setupCustomMatchers, setupScratch, teardown } from './utils';

/**
 * @typedef ArrayLikeMatchers
 * @property {(expectedLength: number) => boolean} toHaveLength
 */

class Todo extends Component {
	componentWillEnter(done) {
		setTimeout(done, 20);
	}
	componentDidEnter() { }

	componentWillLeave(done) {
		setTimeout(done, 20);
	}
	componentDidLeave() { }

	render({ onClick, children }) {
		return <div onClick={onClick} class="item">{children}</div>;
	}
}

class TodoList extends Component {
	constructor() {
		super();

		this.state = {
			items: ['hello', 'world', 'click', 'me']
		};
	}

	handleAdd(item) {
		let { items } = this.state;
		items = items.concat(item);
		this.setState({ items });
	}

	handleRemove(i) {
		let { items } = this.state;
		items.splice(i, 1);
		this.setState({ items });
	}

	render(_, { items }) {
		return (
			<div>
				<TransitionGroup>
					{items.map((item, i) => (
						<Todo key={item} onClick={this.handleRemove.bind(this, i)}>
							{item}
						</Todo>
					))}
				</TransitionGroup>
			</div>
		);
	}
}


describe('TransitionGroup', () => {

	/** @type {HTMLDivElement} */
	let scratch;

	/** @type {TodoList} */
	let list;

	/** @type {(selector: string) => Element[]} */
	let $ = s => [].slice.call(scratch.querySelectorAll(s));

	beforeAll(() => {
		setupCustomMatchers();
	});

	beforeEach(() => {
		jasmine.clock().install();
		scratch = setupScratch();
		render(<TodoList ref={c => list = c} />, scratch);
	});

	afterEach(() => {
		list = null;
		teardown(scratch);
		jasmine.clock().uninstall();
	});

	it('create works', () => {
		expect($('.item')).toHaveLength(4);
	});

	it('enter works', async () => {
		spyOn(Todo.prototype, 'componentWillEnter').and.callThrough();
		spyOn(Todo.prototype, 'componentDidEnter').and.callThrough();

		await act(() => {
			list.handleAdd('foo');
		});

		expect($('.item')).toHaveLength(5);

		jasmine.clock().tick(40);
		await act(() => { });

		expect($('.item')).toHaveLength(5);
		expect(Todo.prototype.componentDidEnter).toHaveBeenCalledTimes(1);
	});

	it('leave works', async () => {
		spyOn(Todo.prototype, 'componentWillLeave').and.callThrough();
		spyOn(Todo.prototype, 'componentDidLeave').and.callThrough();

		await act(() => {
			list.handleRemove(0);
		});

		expect($('.item')).toHaveLength(4);

		jasmine.clock().tick(40);
		await act(() => { });

		expect($('.item')).toHaveLength(3);
		expect(Todo.prototype.componentDidLeave).toHaveBeenCalledTimes(1);
	});

	// it('transitionLeave works', done => {
	// 	// this.timeout(5999);
	// 	list.handleAdd(Date.now());
	//
	// 	setTimeout( () => {
	// 		expect($('.item')).to.have.length(5);
	//
	// 		expect($('.item')[0].className).to.contain('example-enter');
	// 		expect($('.item')[0].className).to.contain('example-enter-active');
	// 	}, 100);
	//
	// 	setTimeout( () => {
	// 		expect($('.item')).to.have.length(5);
	//
	// 		expect($('.item')[0].className).not.to.contain('example-enter');
	// 		expect($('.item')[0].className).not.to.contain('example-enter-active');
	//
	// 		done();
	// 	}, 1400);
	// });
});
