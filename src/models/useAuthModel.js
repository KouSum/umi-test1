import { Modal, Button } from 'antd';
import React from 'react';
import request from 'umi-request';
import qs from 'qs';

const IndexModel = {
  namespace: 'index',
  state: {
    name: '11135',
    param: {},
  },
  effects: {
    *upHttp(
      { payload, url, signal, errorHandler, callback, paramCallback },
      { call, put, select },
    ) {
      //原——请求错误处理
      let errorHandler_y = function(error) {
        const codeMap = {
          '021': '发生错误啦',
          '022': '发生大大大大错误啦',
          // ....
        };
        if (error.response) {
          if (error.data.message === 'no permission editPermission') {
            Modal.error({
              title: '需要验证吗',
              content: <Button>123</Button>,
            });
          } else {
            Modal.error({
              title: '数据请求错误',
              content: error.data.message,
            });
          }
          // 请求已发送但服务端返回状态码非 2xx 的响应
          console.log(error.response.status);
          console.log(error.response.headers);
          console.log(error.data);
          console.log(error.request);
          console.log(codeMap[error.data.status]);
        } else {
          // 请求初始化时出错或者没有响应返回的异常
          console.log(error.message);
        }
      };

      //自定义错误处理
      if (errorHandler && typeof errorHandler === 'function') {
        errorHandler_y = errorHandler;
      }

      let newPayload = {};
      //自定义请求参数
      if (paramCallback && typeof paramCallback === 'function') {
        newPayload = paramCallback(payload);
        console.log(payload);
      } else {
        yield put({ type: 'setParam', payload });
        newPayload = yield select(state => state.index.param);
      }
      let f = function() {
        return new Promise((resolve, reject) => {
          request
            .post(url, {
              data: newPayload,
              signal,
            })
            .then(function(body) {
              resolve(body);
            })
            .catch(function(error) {
              if (error.message !== 'The user aborted a request.') {
                resolve(error.response ? error.response.status : error.message);
                errorHandler_y(error);
              } else {
                alert(error.message);
              }
            });
        });
      };
      const response = yield call(f, payload);
      // 判断是否成功。如果成功在打开弹窗
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    },
  },
  reducers: {
    // 启用 immer 之后
    save(state, action) {
      state.name = action.payload;
    },
    setParam(state, action) {
      let newPayload = {};
      let {
        sorter,
        fData0,
        fData,
        props,
        p,
        rDate,
        csv,
        csvHeaders,
      } = action.payload;
      if (fData['dates']) {
        fData['dates'] = [
          fData0['dates'][0].format('YYYY-MM-DD'),
          fData0['dates'][1].format('YYYY-MM-DD'),
        ];
      } else {
        if (rDate && rDate['dates']) {
          fData['dates'] = [
            rDate['dates'][0].format('YYYY-MM-DD'),
            rDate['dates'][1].format('YYYY-MM-DD'),
          ];
        }
      }
      let uid = [];
      if (fData['uid']) {
        for (let i = 0; i < fData['uid'].length; i++) {
          uid.push(fData['uid'][i].value);
        }
      }

      if (props.uid) {
        fData['uid'] = [props.uid];
      } else {
        fData['uid'] = uid;
      }
      p = { page: p.page - 1, pageSize: p.pageSize };
      newPayload = { p, fData, sorter, csv, csvHeaders };
      state.param = newPayload;
      if (csv === 1) {
        window.open(action.url + '?' + qs.stringify(newPayload));
      }
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/') {
          dispatch({
            type: 'query',
          });
        }
      });
    },
  },
};
export default IndexModel;
