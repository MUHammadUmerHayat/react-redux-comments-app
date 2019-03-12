import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import CommentList from '../components/CommentList'
import { initComments, deleteComment } from '../reducers/comments'

// CommentListContainer
// 一个 Smart 组件，负责评论列表数据的加载、初始化、删除评论
// 沟通 CommentList 和 state
//CommentListContainer内部不需要设置自己的state,因为connect后会，只要store数据变量这个组件会自动render
class CommentListContainer extends Component {
  static propTypes = {
    comments: PropTypes.array,
    initComments: PropTypes.func,
    onDeleteComment: PropTypes.func
  }
  //Useless constructor  no-useless-constructor
  // constructor(props){
  //   super(props)
  // }

  componentWillMount () {
    // componentWillMount 生命周期中初始化评论,也可以用DidMount
    this._loadComments()
  }

  _loadComments () {
    // 从 LocalStorage 中加载评论
    let comments = localStorage.getItem('comments')
    comments = comments ? JSON.parse(comments) : []
    // this.props.initComments 是 mapDispatchToProps 通过 connect 传进来的
    // 可以帮我们把数据初始化到 state 里面去
    this.props.initComments(comments)
  }

  handleDeleteComment (index) {
    // this.props.comments 是 mapStateToProps 通过 connect 传进来的
    const { comments } = this.props
    // props 是不能变的，所以这里新建一个删除了特定下标的评论列表
    const newComments = [
      ...comments.slice(0, index),
      ...comments.slice(index + 1)
    ]
    // 保存最新的评论列表到 LocalStorage
    localStorage.setItem('comments', JSON.stringify(newComments))
    if (this.props.onDeleteComment) {
      // this.props.onDeleteComment 是 connect 传进来的
      // 会 dispatch 一个 action 去删除评论
      this.props.onDeleteComment(index)
    }
  }
  
  /*
  我们一开始传给 CommentListContainer 的 props.comments 
  其实是 reducer 里面初始化的空的 comments 数组，因为还没有从 LocalStorage 里面取数据。

  而 CommentListContainer 内部从 LocalStorage 加载 comments 数据，
  然后调用 this.props.initComments(comments) 会导致 dispatch，
  从而使得真正从 LocalStorage 加载的 comments 初始化到 state 里面去。

  因为 dispatch 了导致 connect 里面的 Connect 包装组件去 state 里面取最新的 comments 
  然后重新渲染，这时候 CommentListContainer 才获得了有数据的 props.comments。
  */
  render () {
    /*执行了两次，初始化 createStore 中 dispatch({})会去初始化一下store state
    this.props.initComments(comments)又导致了一次render
    */
    // console.log('render') 
    //展示来自 mapDispatchToProps 通过 connect 传进来的 comments，初始值是空数组
    return (
      <CommentList
        comments={this.props.comments}
        onDeleteComment={this.handleDeleteComment.bind(this)} />
    )
  }
}

// 评论列表从 state.comments 中获取

const mapStateToProps = (state) => {
  return {
    comments: state.comments
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    // 提供给 CommentListContainer
    // 当从 LocalStorage 加载评论列表以后就会通过这个方法
    // 把评论列表初始化到 state 当中
    initComments: (comments) => {
      dispatch(initComments(comments))
    },
    // 删除评论
    onDeleteComment: (commentIndex) => {
      dispatch(deleteComment(commentIndex))
    }
  }
}

// 将 CommentListContainer connect 到 store，获取 getState 里的数据
// 会把 comments、initComments、onDeleteComment 传给 CommentListContainer
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommentListContainer)