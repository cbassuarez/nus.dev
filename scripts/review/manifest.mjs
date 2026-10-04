// This collection never enters the public page registry, navigation or sitemap.
export const REVIEW_PAGES = [
  ['', 'Overview', 'What ships and what remains.'],
  ['try', 'Try nus', 'One local task in ten minutes.'],
  ['releases', 'Evidence', 'The reviewed release and its checks.'],
  ['funding', 'Funding', 'What the remaining work costs.'],
  ['architecture', 'Architecture', 'What talks to what.'],
  ['security', 'Security', 'Boundaries and evidence.'],
  ['performance', 'Performance', 'Numbers with their scope.'],
  ['cef', 'CEF research', 'A bounded browser question.'],
  ['milestones', 'Milestones', 'Outputs, not promises.'],
  ['limitations', 'Limitations', 'What is not claimed.'],
  ['maintainer', 'Maintainer', 'Who carries the project.']
].map(([slug,title,blurb],i)=>({slug,title,blurb,primary:i<4,number:String(i+1).padStart(2,'0'),path:`/review/${slug?slug+'/':''}`,depth:slug?2:1}));
export const reviewHref = (slug, depth) => `${depth===1?'.':'..'}/${slug?slug+'/':''}`;
