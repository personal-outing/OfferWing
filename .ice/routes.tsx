import { createRouteLoader, WrapRouteComponent, RouteErrorComponent } from '@ice/runtime';
import type { CreateRoutes } from '@ice/runtime';
const createRoutes: CreateRoutes = ({
  requestContext,
  renderMode,
}) => ([
  {
    path: '',
    async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_layout" */ '@/pages/layout');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'layout',
          isLayout: true,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'layout',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
    errorElement: <RouteErrorComponent />,
    componentName: 'layout',
    index: undefined,
    id: 'layout',
    exact: true,
    exports: ["default"],
    layout: true,
    children: [{
      path: 'free/components/FreeMobileMeeting/components/MarkdownContent',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_free-components-freemobilemeeting-components-markdowncontent-index" */ '@/pages/free/components/FreeMobileMeeting/components/MarkdownContent/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'free/components/FreeMobileMeeting/components/MarkdownContent',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'free/components/FreeMobileMeeting/components/MarkdownContent',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'free-components-freemobilemeeting-components-markdowncontent-index',
      index: true,
      id: 'free/components/FreeMobileMeeting/components/MarkdownContent',
      exact: true,
      exports: ["default"],
    },{
      path: 'free/components/FreeMobileMeeting/components/Operation',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_free-components-freemobilemeeting-components-operation-index" */ '@/pages/free/components/FreeMobileMeeting/components/Operation/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'free/components/FreeMobileMeeting/components/Operation',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'free/components/FreeMobileMeeting/components/Operation',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'free-components-freemobilemeeting-components-operation-index',
      index: true,
      id: 'free/components/FreeMobileMeeting/components/Operation',
      exact: true,
      exports: ["default"],
    },{
      path: 'free/components/FreeMobileMeeting/components/Tips',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_free-components-freemobilemeeting-components-tips-index" */ '@/pages/free/components/FreeMobileMeeting/components/Tips/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'free/components/FreeMobileMeeting/components/Tips',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'free/components/FreeMobileMeeting/components/Tips',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'free-components-freemobilemeeting-components-tips-index',
      index: true,
      id: 'free/components/FreeMobileMeeting/components/Tips',
      exact: true,
      exports: ["default"],
    },{
      path: 'free/components/FreePCMeeting/QuestionItem',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_free-components-freepcmeeting-questionitem-index" */ '@/pages/free/components/FreePCMeeting/QuestionItem/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'free/components/FreePCMeeting/QuestionItem',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'free/components/FreePCMeeting/QuestionItem',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'free-components-freepcmeeting-questionitem-index',
      index: true,
      id: 'free/components/FreePCMeeting/QuestionItem',
      exact: true,
      exports: ["default"],
    },{
      path: 'free/components/FreeMobileMeeting',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_free-components-freemobilemeeting-index" */ '@/pages/free/components/FreeMobileMeeting/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'free/components/FreeMobileMeeting',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'free/components/FreeMobileMeeting',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'free-components-freemobilemeeting-index',
      index: true,
      id: 'free/components/FreeMobileMeeting',
      exact: true,
      exports: ["default"],
    },{
      path: 'free/components/FreePCMeeting',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_free-components-freepcmeeting-index" */ '@/pages/free/components/FreePCMeeting/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'free/components/FreePCMeeting',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'free/components/FreePCMeeting',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'free-components-freepcmeeting-index',
      index: true,
      id: 'free/components/FreePCMeeting',
      exact: true,
      exports: ["default"],
    },{
      path: 'dogbrain/feedbackList',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_dogbrain-feedbacklist-index" */ '@/pages/dogbrain/feedbackList/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'dogbrain/feedbackList',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'dogbrain/feedbackList',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'dogbrain-feedbacklist-index',
      index: true,
      id: 'dogbrain/feedbackList',
      exact: true,
      exports: ["default"],
    },{
      path: 'dogbrain/questionList',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_dogbrain-questionlist-index" */ '@/pages/dogbrain/questionList/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'dogbrain/questionList',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'dogbrain/questionList',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'dogbrain-questionlist-index',
      index: true,
      id: 'dogbrain/questionList',
      exact: true,
      exports: ["default"],
    },{
      path: 'dogbrain/senfeedback',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_dogbrain-senfeedback-index" */ '@/pages/dogbrain/senfeedback/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'dogbrain/senfeedback',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'dogbrain/senfeedback',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'dogbrain-senfeedback-index',
      index: true,
      id: 'dogbrain/senfeedback',
      exact: true,
      exports: ["default"],
    },{
      path: 'dogbrain/voiceSlice',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_dogbrain-voiceslice-index" */ '@/pages/dogbrain/voiceSlice/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'dogbrain/voiceSlice',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'dogbrain/voiceSlice',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'dogbrain-voiceslice-index',
      index: true,
      id: 'dogbrain/voiceSlice',
      exact: true,
      exports: ["default"],
    },{
      path: 'dogbrain/voiceList',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_dogbrain-voicelist-index" */ '@/pages/dogbrain/voiceList/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'dogbrain/voiceList',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'dogbrain/voiceList',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'dogbrain-voicelist-index',
      index: true,
      id: 'dogbrain/voiceList',
      exact: true,
      exports: ["default"],
    },{
      path: 'dogbrain/voice',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_dogbrain-voice-index" */ '@/pages/dogbrain/voice/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'dogbrain/voice',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'dogbrain/voice',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'dogbrain-voice-index',
      index: true,
      id: 'dogbrain/voice',
      exact: true,
      exports: ["default"],
    },{
      path: 'writinghistory',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_writinghistory-index" */ '@/pages/writinghistory/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'writinghistory',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'writinghistory',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'writinghistory-index',
      index: true,
      id: 'writinghistory',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'writingdetail',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_writingdetail-index" */ '@/pages/writingdetail/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'writingdetail',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'writingdetail',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'writingdetail-index',
      index: true,
      id: 'writingdetail',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'refundManage',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_refundmanage-index" */ '@/pages/refundManage/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'refundManage',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'refundManage',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'refundmanage-index',
      index: true,
      id: 'refundManage',
      exact: true,
      exports: ["default"],
    },{
      path: 'meetingtask',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_meetingtask-index" */ '@/pages/meetingtask/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'meetingtask',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'meetingtask',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'meetingtask-index',
      index: true,
      id: 'meetingtask',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'myexpdetail',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_myexpdetail-index" */ '@/pages/myexpdetail/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'myexpdetail',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'myexpdetail',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'myexpdetail-index',
      index: true,
      id: 'myexpdetail',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'writingtask',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_writingtask-index" */ '@/pages/writingtask/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'writingtask',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'writingtask',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'writingtask-index',
      index: true,
      id: 'writingtask',
      exact: true,
      exports: ["default"],
    },{
      path: 'experience',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_experience-index" */ '@/pages/experience/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'experience',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'experience',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'experience-index',
      index: true,
      id: 'experience',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'algorithm',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_algorithm-index" */ '@/pages/algorithm/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'algorithm',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'algorithm',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'algorithm-index',
      index: true,
      id: 'algorithm',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'dashboard',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_dashboard-index" */ '@/pages/dashboard/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'dashboard',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'dashboard',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'dashboard-index',
      index: true,
      id: 'dashboard',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'expdetail',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_expdetail-index" */ '@/pages/expdetail/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'expdetail',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'expdetail',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'expdetail-index',
      index: true,
      id: 'expdetail',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'shortlink',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_shortlink-index" */ '@/pages/shortlink/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'shortlink',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'shortlink',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'shortlink-index',
      index: true,
      id: 'shortlink',
      exact: true,
      exports: ["default"],
    },{
      path: 'dogbrain',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_dogbrain-index" */ '@/pages/dogbrain/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'dogbrain',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'dogbrain',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'dogbrain-index',
      index: true,
      id: 'dogbrain',
      exact: true,
      exports: ["default"],
    },{
      path: 'mocktask',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_mocktask-index" */ '@/pages/mocktask/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'mocktask',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'mocktask',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'mocktask-index',
      index: true,
      id: 'mocktask',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'addcoop',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_addcoop-index" */ '@/pages/addcoop/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'addcoop',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'addcoop',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'addcoop-index',
      index: true,
      id: 'addcoop',
      exact: true,
      exports: ["default"],
    },{
      path: 'history',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_history-index" */ '@/pages/history/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'history',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'history',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'history-index',
      index: true,
      id: 'history',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'meeting',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_meeting-index" */ '@/pages/meeting/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'meeting',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'meeting',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'meeting-index',
      index: true,
      id: 'meeting',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'writing',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_writing-index" */ '@/pages/writing/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'writing',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'writing',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'writing-index',
      index: true,
      id: 'writing',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'custom',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_custom-index" */ '@/pages/custom/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'custom',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'custom',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'custom-index',
      index: true,
      id: 'custom',
      exact: true,
      exports: ["default"],
    },{
      path: 'detail',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_detail-index" */ '@/pages/detail/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'detail',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'detail',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'detail-index',
      index: true,
      id: 'detail',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'joinus',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_joinus-index" */ '@/pages/joinus/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'joinus',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'joinus',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'joinus-index',
      index: true,
      id: 'joinus',
      exact: true,
      exports: ["default"],
    },{
      path: 'notice',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_notice-index" */ '@/pages/notice/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'notice',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'notice',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'notice-index',
      index: true,
      id: 'notice',
      exact: true,
      exports: ["default"],
    },{
      path: 'refund',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_refund-index" */ '@/pages/refund/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'refund',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'refund',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'refund-index',
      index: true,
      id: 'refund',
      exact: true,
      exports: ["default"],
    },{
      path: 'coach',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_coach-index" */ '@/pages/coach/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'coach',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'coach',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'coach-index',
      index: true,
      id: 'coach',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'login',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_login-index" */ '@/pages/login/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'login',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'login',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'login-index',
      index: true,
      id: 'login',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'setup',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_setup-index" */ '@/pages/setup/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'setup',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'setup',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'setup-index',
      index: true,
      id: 'setup',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'share',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_share-index" */ '@/pages/share/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'share',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'share',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'share-index',
      index: true,
      id: 'share',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'free',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_free-index" */ '@/pages/free/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'free',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'free',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'free-index',
      index: true,
      id: 'free',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'help',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_help-index" */ '@/pages/help/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'help',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'help',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'help-index',
      index: true,
      id: 'help',
      exact: true,
      exports: ["default"],
    },{
      path: 'mock',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_mock-index" */ '@/pages/mock/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'mock',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'mock',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'mock-index',
      index: true,
      id: 'mock',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'news',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_news-index" */ '@/pages/news/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'news',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'news',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'news-index',
      index: true,
      id: 'news',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'tech',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_tech-index" */ '@/pages/tech/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'tech',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'tech',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'tech-index',
      index: true,
      id: 'tech',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: 'pay',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_pay-index" */ '@/pages/pay/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: 'pay',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: 'pay',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'pay-index',
      index: true,
      id: 'pay',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: '',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_index" */ '@/pages/index');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: '/',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: '/',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: 'index',
      index: true,
      id: '/',
      exact: true,
      exports: ["default","pageConfig"],
    },{
      path: '*',
      async lazy() {
      const componentModule = await import(/* webpackChunkName: "p_$" */ '@/pages/$');
      return {
        ...componentModule,
        Component: () => WrapRouteComponent({
          routeId: '*',
          isLayout: false,
          routeExports: componentModule,
        }),
        loader: createRouteLoader({
          routeId: '*',
          requestContext,
          renderMode,
          module: componentModule,
        }),
      };
    },
      errorElement: <RouteErrorComponent />,
      componentName: '$',
      index: undefined,
      id: '*',
      exact: true,
      exports: ["default"],
    },]
  },
]);
export default createRoutes;
