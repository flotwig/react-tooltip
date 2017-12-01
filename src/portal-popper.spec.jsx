import _ from 'lodash'
import React from 'react'
import { mount, shallow } from 'enzyme'
import sinon from 'sinon'

import Portal from './portal'

import PortalPopper from './portal-popper'

const getProps = (props) => {
  return _.extend({
    placement: 'top',
    title: 'tooltip title',
    getTargetNode: sinon.stub().returns('target node'),
  }, props)
}

const popperInstanceStub = () => ({
  onCreate: sinon.stub(),
  onUpdate: sinon.stub(),
  scheduleUpdate: sinon.spy(),
  destroy: sinon.spy(),
})

const popperStub = (popperInstance) => sinon.stub().returns(popperInstance)

describe('<PortalPopper />', () => {
  it('renders a <Portal /> with a placement class', () => {
    const component = shallow(<PortalPopper {...getProps({ className: 'tooltip' })} />)
    expect(component.find(Portal)).to.have.className('tooltip-top')
  })

  it('renders a <Portal /> with default styles', () => {
    const component = shallow(<PortalPopper {...getProps()} />)
    expect(component.find(Portal).prop('style').position).to.equal('absolute')
    expect(component.find(Portal).prop('style').transform).to.equal('translate3d(0px, 0px, 0)')
    expect(component.find(Portal).prop('style').WebkitTransform).to.equal('translate3d(0px, 0px, 0)')
  })

  it('renders the title specified', () => {
    const component = shallow(<PortalPopper {...getProps()} />)
    expect(component.find('span')).to.have.text('tooltip title')
  })

  it('renders the tooltip arrow with default styles', () => {
    const component = shallow(<PortalPopper {...getProps({})} />)
    expect(component.find('div').prop('style').left).to.equal(0)
    expect(component.find('div').prop('style').top).to.equal(0)
  })

  it('renders with className specified', () => {
    const component = shallow(<PortalPopper {...getProps({ className: 'the-tooltip' })} />)
    expect(component.find(Portal)).to.have.className('the-tooltip')
    expect(component.find(Portal)).to.have.className('the-tooltip-top')
    expect(component.find('div')).to.have.className('the-tooltip-arrow')
  })

  it('uses last className as prefix if multiple', () => {
    const component = shallow(<PortalPopper {...getProps({ className: 'custom-class the-tooltip' })} />)
    expect(component.find(Portal).prop('className')).to.equal('custom-class the-tooltip the-tooltip-top')
    expect(component.find('div').prop('className')).to.equal('the-tooltip-arrow')
  })

  it('creates Popper instance with the right props', () => {
    const Popper = popperStub(popperInstanceStub())
    mount(<PortalPopper {...getProps({ Popper, boundary: 'boundary' })} />)
    expect(Popper).to.have.been.called
    expect(Popper.firstCall.args[0]).to.equal('target node')
    expect(Popper.firstCall.args[2].content).to.equal('tooltip title')
    expect(Popper.firstCall.args[2].placement).to.equal('top')
    expect(Popper.firstCall.args[2].modifiers.preventOverflow).to.eql({
      boundariesElement: 'boundary',
    })
    expect(Popper.firstCall.args[2].onCreate).to.be.a('function')
    expect(Popper.firstCall.args[2].onUpdate).to.be.a('function')
  })

  it('calls scheduleUpdate() on the Popper instance', () => {
    const popperInstance = popperInstanceStub()
    mount(<PortalPopper {...getProps({ Popper: popperStub(popperInstance) })} />)
    expect(popperInstance.scheduleUpdate).to.have.been.called
  })

  it('destroys the Popper instance on unmount', () => {
    const popperInstance = popperInstanceStub()
    const component = mount(<PortalPopper {...getProps({ Popper: popperStub(popperInstance) })} />)
    component.unmount()
    expect(popperInstance.destroy).to.have.been.called
  })

  describe('Popper#onUpate', () => {
    it('updates the arrow props if specified', () => {
      const popperInstance = popperInstanceStub()
      const Popper = popperStub(popperInstance)
      const component = mount(<PortalPopper {...getProps({ Popper })} />)
      Popper.firstCall.args[2].onUpdate({ offsets: { arrow: { left: 5, top: 10 } } })
      expect(component.ref('arrow').prop('style').left).to.equal(5)
      expect(component.ref('arrow').prop('style').top).to.equal(10)
    })

    it('does not update the arrow props if not specified', () => {
      const popperInstance = popperInstanceStub()
      const Popper = popperStub(popperInstance)
      const component = mount(<PortalPopper {...getProps({ Popper })} />)
      Popper.firstCall.args[2].onUpdate({ offsets: {} })
      expect(component.ref('arrow').prop('style').left).to.equal(0)
      expect(component.ref('arrow').prop('style').top).to.equal(0)
    })

    it('only updates the arrow props that are specified', () => {
      const popperInstance = popperInstanceStub()
      const Popper = popperStub(popperInstance)
      const component = mount(<PortalPopper {...getProps({ Popper })} />)
      Popper.firstCall.args[2].onUpdate({ offsets: { arrow: { top: 20 } } })
      expect(component.ref('arrow').prop('style').left).to.equal(null)
      expect(component.ref('arrow').prop('style').top).to.equal(20)
    })

    it('rounds the arrow props', () => {
      const popperInstance = popperInstanceStub()
      const Popper = popperStub(popperInstance)
      const component = mount(<PortalPopper {...getProps({ Popper })} />)
      Popper.firstCall.args[2].onUpdate({ offsets: { arrow: { left: 7.2, top: 20.8 } } })
      expect(component.ref('arrow').prop('style').left).to.equal(7)
      expect(component.ref('arrow').prop('style').top).to.equal(21)
    })

    it('updates the popper props if specified', () => {
      const popperInstance = popperInstanceStub()
      const Popper = popperStub(popperInstance)
      const component = mount(<PortalPopper {...getProps({ Popper })} />)
      Popper.firstCall.args[2].onUpdate({ offsets: { popper: { position: 'relative', left: 2, top: 4 } } })
      expect(component.find(Portal).prop('style').position).to.equal('relative')
      expect(component.find(Portal).prop('style').transform).to.equal('translate3d(2px, 4px, 0)')
      expect(component.find(Portal).prop('style').WebkitTransform).to.equal('translate3d(2px, 4px, 0)')
    })

    it('does not update the popper props if not specified', () => {
      const popperInstance = popperInstanceStub()
      const Popper = popperStub(popperInstance)
      const component = mount(<PortalPopper {...getProps({ Popper })} />)
      Popper.firstCall.args[2].onUpdate({ offsets: {} })
      expect(component.find(Portal).prop('style').position).to.equal('absolute')
      expect(component.find(Portal).prop('style').transform).to.equal('translate3d(0px, 0px, 0)')
      expect(component.find(Portal).prop('style').WebkitTransform).to.equal('translate3d(0px, 0px, 0)')
    })

    it('rounds the popper props', () => {
      const popperInstance = popperInstanceStub()
      const Popper = popperStub(popperInstance)
      const component = mount(<PortalPopper {...getProps({ Popper })} />)
      Popper.firstCall.args[2].onUpdate({ offsets: { popper: { left: 15.2, top: 2.8 } } })
      expect(component.find(Portal).prop('style').transform).to.equal('translate3d(15px, 3px, 0)')
      expect(component.find(Portal).prop('style').WebkitTransform).to.equal('translate3d(15px, 3px, 0)')
    })
  })
})
